import { useState, useEffect } from 'react';
import { fetchSettingData } from './useSettingsCache';

/**
 * Reads the `display_chinese_names` setting from the shared settings cache.
 * Returns true if chinese names should be shown, false if hidden.
 * Defaults to true while loading so products don't flash in/out.
 */
export default function useDisplayChineseNames() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        fetchSettingData('settings', '/settings')
            .then(data => {
                // API returns an array of { key, value } or a flat object
                let val;
                if (Array.isArray(data)) {
                    const entry = data.find(s => s.key === 'display_chinese_names');
                    val = entry?.value;
                } else {
                    val = data?.display_chinese_names ?? data?.settings?.display_chinese_names;
                }
                // Default to true if setting is missing
                setShow(val === undefined || val === null ? true : val === 'true' || val === true);
            })
            .catch(() => setShow(true));
    }, []);

    return show;
}
