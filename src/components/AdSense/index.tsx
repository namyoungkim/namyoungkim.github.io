import React, {useEffect, useRef} from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AD_CLIENT = 'ca-pub-3451604247959932';

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  className,
}: AdSenseProps): JSX.Element | null {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // SSR 체크
    if (typeof window === 'undefined') return;

    // 이미 로드된 광고는 다시 로드하지 않음
    if (isAdLoaded.current) return;

    try {
      // adsbygoogle 배열이 없으면 생성
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }

      // 광고 push
      window.adsbygoogle.push({});
      isAdLoaded.current = true;
    } catch (error) {
      console.error('[AdSense] Failed to load ad:', error);
    }
  }, []);

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{display: 'block', ...style}}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
