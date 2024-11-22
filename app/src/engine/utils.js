const Utils = {
    isMobile() {
        if (navigator.userAgentData?.mobile !== undefined) {
            return navigator.userAgentData.mobile;
        }
        return window.matchMedia('(max-width: 768px)').matches
               || /Mobi|Android/i.test(navigator.userAgent);
    },

    async fetch(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            if (path.includes('webp')) {
                return await response.blob();
            }
            return await response.text();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    dispatchEvent(event) {
        window?.dispatchEvent(new Event(event));
    },

    dispatchCustomEvent(event, detail) {
        window?.dispatchEvent(new CustomEvent(event, { detail }));
    },

    download(data, filename, type) {
        const url = URL.createObjectURL(new Blob([data], { type }));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

export default Utils;
