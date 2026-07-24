<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use App\Models\Product;
use App\Models\Checker;

class TestApiPerformanceCommand extends Command
{
    protected $signature = 'test:api-performance {--runs=10 : Number of requests per endpoint} {--url= : Custom target API base URL}';
    protected $description = 'Benchmark the performance of key API endpoints (Avg, P50, P95, Max, Success Rate)';

    private string $baseUrl = 'http://127.0.0.1:8000/api';
    private string $token = '';

    public function handle(): int
    {
        if ($customUrl = $this->option('url')) {
            $this->baseUrl = rtrim($customUrl, '/');
        }
        $this->info('===========================================================');
        $this->info('          ZTG Heavy Parts — API Performance Benchmark       ');
        $this->info('===========================================================');

        // 1. Authenticate using the admin account
        $user = User::where('role', 'Admin')->first();
        if (!$user) {
            $this->error('Admin user not found. Please run db:seed first.');
            return 1;
        }
        $this->token = $user->createToken('perf-token')->plainTextToken;

        // 2. Resolve fixtures (product + checker for checkout test)
        $product  = Product::whereNull('parent_product_id')->where('stock', '>', 0)->first();
        $productId = $product ? $product->id : 1;

        $checker = Checker::first() ?? Checker::create(['name' => 'Perf Checker', 'status' => 'Active']);
        $checkerId = $checker->id;

        $runs = max(5, (int) $this->option('runs'));
        $this->line("  Runs per endpoint : <info>{$runs}</info>");
        $this->line("  Target server     : <info>{$this->baseUrl}</info>\n");

        // 3. Endpoint definitions
        $endpoints = [
            'GET /products' => [
                'method' => 'GET',
                'url'    => '/products',
                'data'   => [],
            ],
            'GET /pos/products' => [
                'method' => 'GET',
                'url'    => '/pos/products',
                'data'   => [],
            ],
            'POST /pos/checkout' => [
                'method' => 'POST',
                'url'    => '/pos/checkout',
                'data'   => [
                    'customer_name'   => 'Perf Test Customer',
                    'payment_method'  => 'Cash',
                    'amount_tendered' => 99999,
                    'doc_type'        => 'S.I.',
                    'checker_id'      => $checkerId,
                    'cart'            => [
                        ['product_id' => $productId, 'qty' => 1, 'price_tier' => 'price1'],
                    ],
                ],
            ],
            'GET /reports/sales-summary' => [
                'method' => 'GET',
                'url'    => '/reports/sales-summary',
                'data'   => [],
            ],
            'GET /inventory' => [
                'method' => 'GET',
                'url'    => '/inventory',
                'data'   => [],
            ],
            'GET /notifications' => [
                'method' => 'GET',
                'url'    => '/notifications',
                'data'   => [],
            ],
        ];

        // 4. Production targets (ms) for color-coding
        $targets = [
            'GET /products'              => 200,
            'GET /pos/products'          => 200,
            'POST /pos/checkout'         => 700,
            'GET /reports/sales-summary' => 300,
            'GET /inventory'             => 150,
            'GET /notifications'         => 150,
        ];

        $results = [];

        foreach ($endpoints as $name => $spec) {
            $this->comment("  Benchmarking {$name} ...");
            $durations    = [];
            $successCount = 0;

            for ($i = 1; $i <= $runs; $i++) {
                $start = microtime(true);

                $response = $spec['method'] === 'GET'
                    ? Http::withToken($this->token)->acceptJson()->get($this->baseUrl . $spec['url'])
                    : Http::withToken($this->token)->acceptJson()->post($this->baseUrl . $spec['url'], $spec['data']);

                $durations[] = (microtime(true) - $start) * 1000; // ms

                if ($response->successful()) {
                    $successCount++;
                }

                usleep(50_000); // 50 ms cooldown between requests
            }

            sort($durations);

            $avg  = array_sum($durations) / count($durations);
            $min  = $durations[0];
            $max  = end($durations);
            $p50  = $this->percentile($durations, 50);
            $p95  = $this->percentile($durations, 95);
            $rate = intdiv($successCount * 100, $runs);

            $target = $targets[$name] ?? null;
            $status = $target !== null
                ? ($avg <= $target ? '✔ OK' : '✘ SLOW')
                : '—';

            $results[] = [
                $name,
                sprintf('%.0f ms', $avg),
                sprintf('%.0f ms', $p50),
                sprintf('%.0f ms', $p95),
                sprintf('%.0f ms', $max),
                sprintf('%d%%', $rate),
                $runs,
                $status,
            ];
        }

        // 5. Output
        $this->newLine();
        $this->info('===========================================================');
        $this->info('                   Benchmark Results                       ');
        $this->info('===========================================================');

        $this->table(
            ['Endpoint', 'Avg', 'P50 (Median)', 'P95', 'Max', 'Success', 'Requests', 'vs Target'],
            $results
        );

        $this->line('  <comment>P50</comment> = 50% of requests were faster than this value (Median).');
        $this->line('  <comment>P95</comment> = 95% of requests were faster than this value (worst-case).');
        $this->line('  <comment>vs Target</comment> compares Avg latency against production targets.');
        $this->newLine();
        $this->info('Benchmark complete!');

        return 0;
    }

    /**
     * Calculate a percentile value from a pre-sorted array of floats.
     *
     * @param float[] $sorted Already sorted ascending.
     */
    private function percentile(array $sorted, int $pct): float
    {
        $count = count($sorted);
        if ($count === 1) return $sorted[0];

        $index = ($pct / 100) * ($count - 1);
        $lower = (int) floor($index);
        $upper = (int) ceil($index);
        $frac  = $index - $lower;

        return $sorted[$lower] + $frac * ($sorted[$upper] - $sorted[$lower]);
    }
}
