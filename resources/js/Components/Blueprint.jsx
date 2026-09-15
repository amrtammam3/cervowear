// The Industry design system's wireframe frame: a hairline border with "+"
// registration marks at each corner. Wrap any card, figure, or panel in
// this instead of hand-rolling the four <i class="corner ..."> children.
export default function Blueprint({ as: Tag = 'div', className = '', style, children, ...rest }) {
  return (
    <Tag className={`blueprint ${className}`.trim()} style={style} {...rest}>
      <i className="corner tl"></i>
      <i className="corner tr"></i>
      <i className="corner bl"></i>
      <i className="corner br"></i>
      {children}
    </Tag>
  );
}
