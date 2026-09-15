import { useEffect, useRef, useState } from 'react';

const OFFSETS = {
  up: 'translateY(-18px)',
  down: 'translateY(18px)',
  left: 'translateX(-28px)',
  right: 'translateX(28px)',
};

// A restrained scroll-in reveal — fades and eases into place the first time
// an element enters the viewport, then leaves it alone. Built for section
// titles and other one-time "the page is alive" moments, not for every
// element on the page (that reads as cheap, not premium).
export default function Reveal({ children, direction = 'up', delay = 0, as: Tag = 'div', style, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : OFFSETS[direction],
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
