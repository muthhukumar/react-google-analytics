import * as React from 'react';

declare global {
  interface Window {
    gtag: (
      option: string,
      action: string,
      options: Record<string, string>
    ) => void;
  }
}

interface GaContextType {
  GA_TRACKING_ID: string | undefined;
  trackPageView:
    | undefined
    | ((
        option: string,
        gaTrackingId: string,
        options: Record<string, string>
      ) => void);
  trackEvent: undefined | ((props: Record<string, string>) => void);
}

const GaContext = React.createContext<GaContextType>({
  GA_TRACKING_ID: '',
  trackEvent: undefined,
  trackPageView: undefined,
});

export const GaContextProvider = ({
  GA_TRACKING_ID,
  children,
}: {
  GA_TRACKING_ID: GaContextType['GA_TRACKING_ID'];
  children: React.ReactNode;
}) => {
  if (!GA_TRACKING_ID) {
    console.warn(`GA_TRACKING_ID is not provided`);
    return children;
  }

  const trackPageView = React.useCallback((url: string) => {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }, []);

  const trackEvent = React.useCallback(
    ({ action, category, label, value }: Record<string, string>) => {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    },
    []
  );

  return (
    <GaContext.Provider value={{ GA_TRACKING_ID, trackPageView, trackEvent }}>
      {children}
    </GaContext.Provider>
  );
};

const useGaContext = () => {
  const context = React.useContext(GaContext);

  if (!context) {
    throw new Error('useGaContext cannot be used outside of GaContextProvider');
  }
  return useGaContext;
};

export const GaScripts = ({ lazyLoad = true }: { lazyLoad: boolean }) => {
  const GA_TRACKING_ID = useGaContext();
  return (
    <>
      <script
        async={lazyLoad}
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        async
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '${GA_TRACKING_ID}', {
        page_path: window.location.pathname,
      });
    `,
        }}
      />
    </>
  );
};
