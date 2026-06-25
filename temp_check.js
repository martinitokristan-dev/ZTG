

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const bgColor = type === 'success' ? '#10B981' : '#EF4444';
            const icon = type === 'success' 
                ? `<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2;"><path d="M5 13l4 4L19 7"/></svg>`
                : `<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2;"><path d="M6 18L18 6M6 6l12 12"/></svg>`;

            toast.style.cssText = `
                background: ${bgColor};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                gap: 12px;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 500;
                opacity: 0;
                transform: translateY(100%);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            
            toast.innerHTML = `
                ${icon}
                <span>${message}</span>
            `;
            
            container.appendChild(toast);
            
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            });
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        let resCartItems = [];

        function loadProductSelect() {
            const products = db.getProducts();
            const select = document.getElementById('resItemSelect');
            select.innerHTML = '<option value="">Search product...</option>';
            products.forEach(p => {
                select.innerHTML += `<option value="${p.id}">${p.name} (${p.partNo}) - â‚±${p.price1.toLocaleString()}</option>`;
            });
        }

        function addResCartItem() {
            const pId = parseInt(document.getElementById('resItemSelect').value);
            if (!pId) return;

            const product = db.getProducts().find(p => p.id === pId);
            if (!product) return;

            const existing = resCartItems.find(i => i.id === pId);
            if (existing) {
                existing.qty++;
            } else {
                resCartItems.push({
                    id: product.id,
                    name: product.name,
                    partNo: product.partNo,
                    price: product.price1,
                    qty: 1
                });
            }
            
            document.getElementById('resItemSelect').value = '';
            renderResCart();
        }

        function removeResCartItem(index) {
            resCartItems.splice(index, 1);
            renderResCart();
        }

        function updateResCartQty(index, newQty) {
            const qty = parseInt(newQty);
            if (qty > 0) {
                resCartItems[index].qty = qty;
            } else {
                resCartItems[index].qty = 1;
            }
            renderResCart();
        }

        function renderResCart() {
            const tbody = document.getElementById('resCartBody');
            tbody.innerHTML = '';

            if (resCartItems.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94A3B8;">No items added yet.</td></tr>';
                updateResPricing();
                return;
            }

            resCartItems.forEach((item, index) => {
                const total = item.price * item.qty;
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #E2E8F0';
                tr.innerHTML = `
                    <td style="padding: 10px 16px;">
                        <div style="font-weight: 600; color: #1E293B;">${item.name}</div>
                        <div style="font-size: 11px; color: #64748B;">${item.partNo}</div>
                    </td>
                    <td style="padding: 10px 16px; text-align: center;">
                        <input type="number" value="${item.qty}" min="1" onchange="updateResCartQty(${index}, this.value)" style="width: 50px; padding: 4px; text-align: center; border: 1px solid #E2E8F0; border-radius: 4px;">
                    </td>
                    <td style="padding: 10px 16px; text-align: right; color: #334155;">â‚±${item.price.toLocaleString(undefined, {minimumFractionDigits: 0})}</td>
                    <td style="padding: 10px 16px; text-align: right; font-weight: 600; color: #0F172A;">â‚±${total.toLocaleString(undefined, {minimumFractionDigits: 0})}</td>
                    <td style="padding: 10px 16px; text-align: center;">
                        <button type="button" onclick="removeResCartItem(${index})" style="background: #FEF2F2; color: #EF4444; border: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2;"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            updateResPricing();
        }

        function updateResPricing() {
            const subtotal = resCartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const tax = subtotal * 0.12;
            const subtotalWithoutTax = subtotal - tax;

            document.getElementById('resTotalVal').value = subtotal;
            document.getElementById('resSubtotalDisplay').innerText = `â‚±${subtotalWithoutTax.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('resTaxDisplay').innerText = `â‚±${tax.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('resTotalDisplay').innerText = `â‚±${subtotal.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            
            // Auto-set deposit to mandatory 50% of total
            const deposit50 = subtotal * 0.5;
            document.getElementById('resDeposit').value = deposit50 > 0 ? deposit50.toFixed(2) : '';
            calculateResBalance();
        }

        function calculateResBalance() {
            const total = parseFloat(document.getElementById('resTotalVal').value) || 0;
            // Deposit is always 50% of total
            const deposit = total * 0.5;
            const balance = Math.max(0, total - deposit);
            document.getElementById('resBalanceDisplay').value = balance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
        }

        function renderReservations() {
            const reservations = db.getReservations();
            const searchVal = document.getElementById('resSearch').value.toLowerCase();
            const statusVal = document.getElementById('statusFilter').value;
            const tbody = document.getElementById('reservationsTableBody');

            tbody.innerHTML = '';

            const filtered = reservations.filter(r => {
                const searchStr = r.customer + ' ' + (r.items ? r.items.map(i => i.name).join(' ') : r.item) + ' ' + r.phone;
                return searchStr.toLowerCase().includes(searchVal);
            }).filter(r => {
                return statusVal === 'All' || r.status === statusVal;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: var(--text-secondary); padding: 20px;">No orders found.</td></tr>';
                return;
            }

            filtered.forEach(r => {
                let badgeClass = r.status === 'Completed' ? 'badge-success' : 'badge-warning';

                // Format items display
                let itemsDisplay = '';
                let totalQty = 0;
                
                if (r.items && r.items.length > 0) {
                    itemsDisplay = `<strong style="color: var(--text-primary); font-size: 13px; display: block;">${r.items[0].name}</strong>`;
                    if (r.items.length > 1) {
                        itemsDisplay += `<span style="font-size: 11px; color: var(--text-secondary);">+ ${r.items.length - 1} more item(s)</span>`;
                    }
                    totalQty = r.items.reduce((sum, item) => sum + item.qty, 0);
                } else {
                    // Legacy fallback
                    itemsDisplay = `<strong style="color: var(--text-primary); font-size: 13px; display: block;">${r.item || 'Legacy Item'}</strong>`;
                    totalQty = r.qty || 1;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-bold">${r.customer}</td>
                    <td>${r.phone}</td>
                    <td>${itemsDisplay}</td>
                    <td>${totalQty}</td>
                    <td class="font-bold" style="color: var(--primary);">â‚±${r.deposit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td class="font-bold">â‚±${r.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${r.date}</td>
                    <td><code>${r.pickupDate}</code></td>
                    <td style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">${r.reservedBy || 'â€”'}</td>
                    <td><span class="badge ${badgeClass}">${r.status}</span></td>
                    <td style="text-align: center;">
                        <div class="btn-group" style="display: flex; gap: 4px; justify-content: center;">
                            ${r.status === 'Pending' ? 
                                `<button class="btn btn-primary btn-sm" onclick="promptFulfillOrder('${r.id}')" style="padding: 4px 10px; font-size: 11px; background: #ECFDF5; color: #10B981; border: none;">Fulfill</button>
                                 <button class="btn btn-secondary btn-sm" onclick="promptCancelOrder('${r.id}')" style="padding: 4px 10px; font-size: 11px; background: #FEF2F2; color: #EF4444; border: none;">Cancel</button>` : 
                                `<span style="font-size:12px; color: var(--text-secondary); font-weight: 500;">Fulfilled</span>`
                            }
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openAddResModal() {
            document.getElementById('addResForm').reset();
            resCartItems = [];
            renderResCart();
            loadProductSelect();
            // Default expected date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('resDate').value = tomorrow.toISOString().substring(0, 10);
            
            document.getElementById('resSubtotalDisplay').innerText = 'â‚±0.00';
            document.getElementById('resTaxDisplay').innerText = 'â‚±0.00';
            document.getElementById('resTotalDisplay').innerText = 'â‚±0.00';
            document.getElementById('resBalanceDisplay').value = '0';
            
            openModal('addResModal');
        }

        function handleAddReservation(event) {
            event.preventDefault();
            const reservations = db.getReservations();

            if (resCartItems.length === 0) {
                showToast('Please add at least one item to the order.', 'error');
                return;
            }

            const deposit = parseFloat(document.getElementById('resDeposit').value) || 0;
            const total = parseFloat(document.getElementById('resTotalVal').value);

            const newRes = {
                id: 'ORD-2026-' + Math.floor(Math.random() * 900 + 100),
                items: JSON.parse(JSON.stringify(resCartItems)),
                customer: document.getElementById('resCustName').value.trim(),
                phone: document.getElementById('resCustPhone').value.trim(),
                email: document.getElementById('resCustEmail').value.trim(),
                notes: document.getElementById('resNotes').value.trim(),
                paymentMethod: document.getElementById('resPaymentMethod').value,
                deposit: deposit,
                total: total,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                pickupDate: document.getElementById('resDate').value,
                pickupTime: document.getElementById('resTime').value,
                reservedBy: (typeof getCurrentUser === 'function' && getCurrentUser()?.name) || 'Unknown',
                status: 'Pending'
            };

            reservations.push(newRes);
            db.saveReservations(reservations);

            // Record deposit payment transaction in history logs
            const transactions = db.getTransactions();
            let resItemNames = '';
            let resQty = 0;
            if (newRes.items && newRes.items.length > 0) {
                resItemNames = newRes.items.length > 1 ? `Reservation Deposit (${newRes.items.length} Items)` : `${newRes.items[0].name} (Deposit)`;
                resQty = newRes.items.reduce((sum, i) => sum + i.qty, 0);
            } else {
                resItemNames = 'Reservation Deposit';
                resQty = 1;
            }

            const depositTx = {
                siNo: newRes.id, // Store reservation order ID directly under Receipt/Invoice ID column
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                itemName: resItemNames,
                customer: newRes.customer,
                qty: resQty,
                amount: newRes.deposit, // Record the exact deposit amount (1250 example)
                payment: newRes.paymentMethod, // Payment method name only (no explanation here)
                cashier: newRes.reservedBy,
                status: 'Completed',
                phone: newRes.phone,
                reason: `50% Deposit for reservation ${newRes.id}` // Full explanation goes to the Reason column!
            };

            transactions.unshift(depositTx);
            db.saveTransactions(transactions);

            closeModal('addResModal');
            renderReservations();
            
            // Populate and Show Success Modal
            document.getElementById('successOrderNo').innerText = newRes.id;
            document.getElementById('successTotal').innerText = `â‚±${newRes.total.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('successDeposit').innerText = `â‚±${newRes.deposit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            
            const balance = Math.max(0, newRes.total - newRes.deposit);
            const balanceStr = `â‚±${balance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            
            document.getElementById('successCustName').innerText = newRes.customer;
            document.getElementById('successCustPhone').innerText = newRes.phone;
            
            // Format pickup date for display
            const pickupD = new Date(newRes.pickupDate);
            const pickupFormatted = pickupD.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            document.getElementById('successPickupDate').innerText = `${pickupFormatted} ${newRes.pickupTime ? 'at ' + newRes.pickupTime : ''}`;
            
            document.getElementById('successBalance').innerText = balanceStr;
            document.getElementById('successNextBalance').innerText = balanceStr;
            
            const alertD = new Date(pickupD);
            alertD.setDate(alertD.getDate() - 1);
            document.getElementById('successNextDateStr').innerText = `System will alert you 24 hours before pickup date (${alertD.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}).`;

            document.getElementById('successItemCount').innerText = `ITEMS ORDERED (${newRes.items.length})`;
            
            const itemsListDiv = document.getElementById('successItemsList');
            itemsListDiv.innerHTML = newRes.items.map(i => `
                <div style="display: flex; justify-content: space-between;">
                    <span>${i.name}</span>
                    <span style="color: #94A3B8;">x${i.qty}</span>
                </div>
            `).join('');

            openModal('orderSuccessModal');
        }

        let activeFulfillId = null;

        function calculateFFChange() {
            const balance = parseFloat(document.getElementById('ffBalanceHiddenVal').value) || 0;
            const payment = parseFloat(document.getElementById('fulfillPayment').value) || 0;
            const change = Math.max(0, payment - balance);
            document.getElementById('ffChangeDisplay').value = change.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
        }

        function promptFulfillOrder(id) {
            const reservations = db.getReservations();
            const res = reservations.find(r => r.id === id);
            if (!res) return;

            activeFulfillId = id;
            
            // Populate Left Column
            document.getElementById('ffOrderNo').innerText = res.id;
            document.getElementById('ffCustomerName').innerText = res.customer;
            document.getElementById('ffContact').innerText = res.phone;
            
            // Reformat dates
            const orderD = new Date(res.date || Date.now());
            document.getElementById('ffOrderDate').innerText = orderD.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            const pickupD = new Date(res.pickupDate);
            document.getElementById('ffPickupDate').innerText = pickupD.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            // Items List
            const tbody = document.getElementById('ffItemsList');
            tbody.innerHTML = '';
            
            const products = db.getProducts();
            
            if (res.items && res.items.length > 0) {
                res.items.forEach(item => {
                    const product = products.find(p => p.id === item.id) || { location: 'N/A' };
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #E2E8F0';
                    tr.innerHTML = `
                        <td style="padding: 12px 16px;">
                            <div style="font-weight: 600; color: #1E293B;">${item.name}</div>
                            <div style="font-size: 11px; color: #94A3B8;">${item.partNo} | Location: ${product.location}</div>
                        </td>
                        <td style="padding: 12px 16px; text-align: right; color: #94A3B8;">x${item.qty}</td>
                        <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #0F172A;">â‚±${(item.price * item.qty).toLocaleString(undefined, {minimumFractionDigits: 0})}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else if (res.item) {
                // Legacy
                const product = products.find(p => p.name === res.item) || { location: 'N/A', partNo: 'N/A' };
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px 16px;">
                        <div style="font-weight: 600; color: #1E293B;">${res.item}</div>
                        <div style="font-size: 11px; color: #94A3B8;">${product.partNo} | Location: ${product.location}</div>
                    </td>
                    <td style="padding: 12px 16px; text-align: right; color: #94A3B8;">x${res.qty || 1}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #0F172A;">â‚±${res.total.toLocaleString(undefined, {minimumFractionDigits: 0})}</td>
                `;
                tbody.appendChild(tr);
            }

            // Financials
            const totalGross = res.total;
            const subtotalWithoutTax = totalGross / 1.12;
            const tax = totalGross - subtotalWithoutTax;
            
            document.getElementById('ffSubtotal').innerText = `â‚±${subtotalWithoutTax.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('ffTax').innerText = `â‚±${tax.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('ffTotalAmount').innerText = `â‚±${totalGross.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('ffDepositPaid').innerText = `- â‚±${res.deposit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            
            const balance = Math.max(0, res.total - res.deposit);
            document.getElementById('ffBalanceDue').innerText = `â‚±${balance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            
            // Set Hidden Val for Balance
            document.getElementById('ffBalanceHiddenVal').value = balance;

            // Populate Right Column
            document.getElementById('fulfillPayment').value = balance; // Default to exact amount
            document.getElementById('fulfillPayment').min = balance;
            calculateFFChange();
            
            // Serve By: always use the actual logged-in user, never hardcode 'Admin'
            const currentUser = (typeof getCurrentUser === 'function' && getCurrentUser()) || { name: 'Unknown User' };
            document.getElementById('ffServedBy').value = currentUser.name;

            // Commission
            const commission = totalGross * 0.05;
            document.getElementById('ffCommLabel').innerText = `Commission Earned (5% of â‚±${totalGross.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})})`;
            document.getElementById('ffCommValue').innerText = `â‚±${commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            document.getElementById('confirmFulfillBtn').onclick = () => completeReservation(id);
            openModal('fulfillOrderModal');
        }

        function completeReservation(id) {
            const reservations = db.getReservations();
            const products = db.getProducts();
            const transactions = db.getTransactions();

            const resIndex = reservations.findIndex(r => r.id === id);
            if (resIndex === -1) return;

            const res = reservations[resIndex];
            
            // Validate stock for all items
            let hasInsufficientStock = false;
            let insufficientItemName = '';
            
            if (res.items && res.items.length > 0) {
                for (const orderItem of res.items) {
                    const product = products.find(p => p.id === orderItem.id);
                    if (!product || product.stock < orderItem.qty) {
                        hasInsufficientStock = true;
                        insufficientItemName = orderItem.name;
                        break;
                    }
                }
            } else if (res.item) { // Legacy single item
                const product = products.find(p => p.name === res.item);
                if (!product || product.stock < res.qty) {
                    hasInsufficientStock = true;
                    insufficientItemName = res.item;
                }
            }

            if (hasInsufficientStock) {
                showToast(`Cannot fulfill! Insufficient shelf stock for ${insufficientItemName}.`, 'error');
                return;
            }
            
            const payment = parseFloat(document.getElementById('fulfillPayment').value) || 0;
            const balance = Math.max(0, res.total - res.deposit);
            const paymentMethod = document.getElementById('ffPaymentMethod').value;
            const docType = document.getElementById('ffDocType').value;
            
            if (payment < balance) {
                showToast(`Minimum payment required is â‚±${balance.toLocaleString()}`, 'error');
                return;
            }
            
            const change = Math.max(0, payment - balance);

            // Deduct stock for all items
            if (res.items && res.items.length > 0) {
                res.items.forEach(orderItem => {
                    const product = products.find(p => p.id === orderItem.id);
                    if (product) {
                        product.stock -= orderItem.qty;
                        product.salesCount = (product.salesCount || 0) + orderItem.qty;
                    }
                });
            } else if (res.item) {
                const product = products.find(p => p.name === res.item);
                if (product) {
                    product.stock -= res.qty;
                    product.salesCount = (product.salesCount || 0) + res.qty;
                }
            }
            
            db.saveProducts(products);

            // Record invoice transaction
            const invoicePrefix = docType === 'S.I. (Sales Invoice)' ? 'SI' : 'OR';
            const invoiceNo = invoicePrefix + '-2026-' + Math.floor(Math.random() * 900 + 100);
            
            // Determine transaction item name
            let txItemName = '';
            let txQty = 0;
            if (res.items && res.items.length > 0) {
                txItemName = res.items.length > 1 ? `Order Based Release (${res.items.length} Items)` : `${res.items[0].name} (Order Release)`;
                txQty = res.items.reduce((sum, i) => sum + i.qty, 0);
            } else {
                txItemName = `${res.item} (Order Release)`;
                txQty = res.qty || 1;
            }

            const newTx = {
                siNo: invoiceNo,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                itemName: txItemName,
                customer: res.customer,
                qty: txQty,
                amount: balance, // remaining pickup amount (1250 example)
                payment: paymentMethod, // raw payment method name only
                cashier: document.getElementById('ffServedBy').value,
                status: 'Completed',
                phone: res.phone,
                reason: `Pickup final payment for reservation ${res.id}` // Full explanation stored under reason
            };

            transactions.unshift(newTx);
            db.saveTransactions(transactions);

            // Complete reservation status
            reservations[resIndex].status = 'Completed';
            db.saveReservations(reservations);

            closeModal('fulfillOrderModal');
            showToast(`Order pickup filed under invoice ${invoiceNo}.`);
            renderReservations();

            // Populate and Show Success Modal
            document.getElementById('fulfilledOrderNo').innerText = res.id;
            document.getElementById('fulfilledCustName').innerText = res.customer;
            document.getElementById('fulfilledContact').innerText = res.phone;
            
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            document.getElementById('fulfilledDate').innerText = `${newTx.date} at ${timeStr}`;
            
            document.getElementById('fulfilledBalance').innerText = `â‚±${balance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('fulfilledTotalAmount').innerText = `â‚±${res.total.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('fulfilledDeposit').innerText = `â‚±${res.deposit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('fulfilledBalancePaid').innerText = `â‚±${balance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            
            document.getElementById('fulfilledPaymentMethod').innerText = paymentMethod;
            document.getElementById('fulfilledAmountReceived').innerText = `â‚±${payment.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            document.getElementById('fulfilledChangeGiven').innerText = `â‚±${change.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            
            const commission = res.total * 0.05;
            document.getElementById('fulfilledCommission').innerText = `â‚±${commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('fulfilledCommissionDesc').innerText = `5% of total sale (â‚±${res.total.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})})`;
            
            const items = res.items && res.items.length > 0 ? res.items : [{ name: res.item, qty: res.qty || 1 }];
            document.getElementById('fulfilledItemCount').innerText = `ITEMS RELEASED (${items.length})`;
            
            const itemsListDiv = document.getElementById('fulfilledItemsList');
            itemsListDiv.innerHTML = items.map(i => `
                <div style="display: flex; justify-content: space-between;">
                    <span>${i.name}</span>
                    <span style="color: #166534;">x${i.qty}</span>
                </div>
            `).join('');
            
            document.getElementById('fulfilledDocType').innerText = docType;
            
            openModal('orderFulfilledModal');
        }

        let activeCancelId = null;

        function promptCancelOrder(id) {
            const reservations = db.getReservations();
            const res = reservations.find(r => r.id === id);
            if (!res) return;

            activeCancelId = id;
            document.getElementById('cancelDepositAmount').innerText = `â‚±${res.deposit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('confirmCancelBtn').onclick = () => cancelReservation(id);
            openModal('cancelOrderModal');
        }

        function cancelReservation(id) {
            const reservations = db.getReservations();
            const transactions = db.getTransactions();

            const resIndex = reservations.findIndex(r => r.id === id);
            if (resIndex === -1) return;

            const res = reservations[resIndex];
            
            // Format items text
            let itemsText = res.items ? `${res.items.length} items` : res.item;
            let qtyText = res.items ? res.items.reduce((sum, i) => sum + i.qty, 0) : res.qty;
            
            // Log in transaction log (History Logs)
            const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            const dateStr = new Date().toLocaleDateString('en-US', dateOptions) + ', ' + new Date().toLocaleTimeString('en-US', timeOptions);
            
            transactions.unshift({
                siNo: res.id,
                date: dateStr,
                itemName: `Cancelled Reservation: ${itemsText}`,
                customer: res.customer || 'Anonymous',
                qty: qtyText || 1,
                amount: 0,
                payment: 'None',
                cashier: res.reservedBy || 'Admin',
                status: 'Cancelled',
                type: 'system',
                phone: res.phone || '',
                refundReason: 'Reservation Cancelled',
                notes: `Deposit returned: â‚±${(res.deposit || 0).toLocaleString()}`
            });
            db.saveTransactions(transactions);

            // Remove from list
            reservations.splice(resIndex, 1);
            db.saveReservations(reservations);

            closeModal('cancelOrderModal');
            showToast('Order cancelled.');
            renderReservations();
        }

        function printReservationReceipt() {
            // Get the data from the fulfilled modal
            const orderNo = document.getElementById('fulfilledOrderNo').innerText;
            const custName = document.getElementById('fulfilledCustName').innerText;
            const contact = document.getElementById('fulfilledContact').innerText;
            const date = document.getElementById('fulfilledDate').innerText;
            const balance = document.getElementById('fulfilledBalance').innerText;
            const totalAmount = document.getElementById('fulfilledTotalAmount').innerText;
            const deposit = document.getElementById('fulfilledDeposit').innerText;
            const balancePaid = document.getElementById('fulfilledBalancePaid').innerText;
            const paymentMethod = document.getElementById('fulfilledPaymentMethod').innerText;
            const amountReceived = document.getElementById('fulfilledAmountReceived').innerText;
            const changeGiven = document.getElementById('fulfilledChangeGiven').innerText;
            const commission = document.getElementById('fulfilledCommission').innerText;
            const docType = document.getElementById('fulfilledDocType').innerText;
            const itemsList = document.getElementById('fulfilledItemsList').innerHTML;

            // Create print window
            const printWindow = window.open('', '', 'width=800,height=600');
            
            const receiptHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reservation Receipt - ${orderNo}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Courier New', monospace; 
                            padding: 20px; 
                            font-size: 12px; 
                            line-height: 1.4;
                        }
                        .receipt { max-width: 300px; margin: 0 auto; }
                        .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                        .header h1 { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                        .header p { font-size: 11px; }
                        .section { margin-bottom: 15px; }
                        .section-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #000; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                        .label { font-weight: bold; }
                        .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin: 10px 0; }
                        .item { display: flex; justify-content: space-between; margin-bottom: 3px; }
                        .total-section { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; margin: 10px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 15px; font-size: 11px; border-top: 2px dashed #000; padding-top: 10px; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <h1>ZTG HEAVY PARTS</h1>
                            <p>Order Fulfillment Receipt</p>
                            <p>${docType}</p>
                        </div>

                        <div class="section">
                            <div class="row"><span class="label">Order No:</span><span>${orderNo}</span></div>
                            <div class="row"><span class="label">Date:</span><span>${date}</span></div>
                            <div class="row"><span class="label">Customer:</span><span>${custName}</span></div>
                            <div class="row"><span class="label">Contact:</span><span>${contact}</span></div>
                        </div>

                        <div class="items">
                            <div class="section-title">ITEMS RELEASED</div>
                            ${itemsList.replace(/<div style="[^"]*">/g, '<div class="item">').replace(/<span style="[^"]*">/g, '<span>')}
                        </div>

                        <div class="section">
                            <div class="row"><span>Total Order Amount:</span><span>${totalAmount}</span></div>
                            <div class="row"><span>Deposit (Prev Paid):</span><span>${deposit}</span></div>
                        </div>

                        <div class="total-section">
                            <div class="row"><span>BALANCE COLLECTED:</span><span>${balance}</span></div>
                        </div>

                        <div class="section">
                            <div class="row"><span>Payment Method:</span><span>${paymentMethod}</span></div>
                            <div class="row"><span>Amount Received:</span><span>${amountReceived}</span></div>
                            <div class="row"><span>Change Given:</span><span>${changeGiven}</span></div>
                        </div>

                        <div class="section" style="background: #f0f0f0; padding: 5px; text-align: center;">
                            <div style="font-size: 10px;">Commission Earned</div>
                            <div style="font-size: 14px; font-weight: bold;">${commission}</div>
                        </div>

                        <div class="footer">
                            <p>Thank you for your business!</p>
                            <p>--- ZTG Heavy Parts ---</p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            // Close after printing or cancel
                            setTimeout(function() { window.close(); }, 100);
                        }
                    <\/script>
                </body>
                </html>
            `;
            
            printWindow.document.write(receiptHTML);
            printWindow.document.close();
        }

        renderReservations();
    
