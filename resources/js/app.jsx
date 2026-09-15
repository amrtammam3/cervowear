import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from '@/lib/StoreContext';

const appName = import.meta.env.VITE_APP_NAME || 'CERVOWEAR';

createInertiaApp({
    title: (title) => (title ? title : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StoreProvider>
                <App {...props} />
            </StoreProvider>,
        );
    },
    progress: {
        color: '#5980a6',
    },
});
