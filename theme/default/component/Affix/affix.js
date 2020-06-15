import * as React from 'react';
import { throttle } from './utils';

const { useState, useEffect, useRef } = React;

const Sticky = ({
  offsetTop,
  offsetBottom,
  children,
  target,
  onChange,
  className,
  style,
  width,
  affixStyle,
}) => {
  const placeholderRef = useRef(null);
  const wrapperRef = useRef(null);
  const [positionStyle, setPositionStyle] = useState({});
  // 滚动元素
  let scrollElm = window;
  // 是否是绝对布局模式
  const fixedRef = useRef(false);
  const [fixed, setFixed] = useState(fixedRef.current);
  const validValue = (value) => {
    return typeof value === 'number';
  };
  const setWrapperDimension = () => {
    // eslint-disable-next-line no-shadow
    const { width, height } = wrapperRef.current
      ? wrapperRef.current.getBoundingClientRect()
      : {};
    placeholderRef.current &&
      (placeholderRef.current.style.height = `${height}px`);
    placeholderRef.current &&
      (placeholderRef.current.style.width = `${width}px`);
  };
  const updateFixed = () => {
    fixedRef.current = !fixedRef.current;
    setFixed(fixedRef.current);
  };
  const handleScroll = () => {
    const rect =
      placeholderRef.current && placeholderRef.current.getBoundingClientRect();
    if (!rect) return;
    let { top, bottom } = rect;
    // eslint-disable-next-line no-shadow
    const style = { width: width || '100%', zIndex: 999 };
    let containerTop = 0; // 容器距离视口上侧的距离
    let containerBottom = 0; // 容器距离视口下侧的距离

    if (scrollElm === window) {
      bottom = window.innerHeight - bottom;
    } else {
      const containerRect = scrollElm && scrollElm.getBoundingClientRect();
      containerTop = containerRect && containerRect.top;
      containerBottom = containerRect && containerRect.bottom;
      top -= containerTop; // 距离容器顶部的距离
      bottom = containerBottom - bottom; // 距离容器底部的距离
    }

    if (
      (validValue(offsetTop) && top <= offsetTop) ||
      (validValue(offsetBottom) && bottom <= offsetBottom)
    ) {
      if (!fixedRef.current) {
        style.position = 'fixed';
        validValue(offsetTop) && (style.top = offsetTop + containerTop);
        validValue(offsetBottom) &&
          (style.bottom =
            scrollElm === window
              ? bottom
              : window.innerHeight - (containerBottom - offsetBottom));
        onChange && onChange(true);
        updateFixed();
        setPositionStyle(style);
      }
    } else if (fixedRef.current) {
      style.position = 'relative';
      onChange && onChange(false);
      updateFixed();
      setPositionStyle(style);
    }
  };

  const scroll = throttle(handleScroll, 20);

  useEffect(() => {
    // 在子节点移开父节点后保持原来占位
    setWrapperDimension();
  }, [fixed]);

  useEffect(() => {
    if (target) scrollElm = target();
    scrollElm.addEventListener('scroll', scroll);
    return () => {
      if (target) scrollElm = target();
      scrollElm.removeEventListener('scroll', scroll);
    };
  }, [offsetTop, offsetBottom]);

  return (
    <div ref={placeholderRef} style={style} className={className}>
      <div ref={wrapperRef} style={{ ...positionStyle, ...affixStyle }}>
        {children}
      </div>
    </div>
  );
};

export default Sticky;