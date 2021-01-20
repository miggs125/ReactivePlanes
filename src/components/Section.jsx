import { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import state from '../store';
import lerp from '../util/lerp';
import useSection from '../hooks/useSection';

const { offsetContext } = state;

export default function Section({ children, offset, factor, ...props}) {
  const ref = useRef();

  const {offset: parentOffset, sectionHeight } = useSection();
  offset = offset !== undefined ? offset : parentOffset;

  useFrame(() => {
    // position from top of section to top of viewport
    const currentY = ref.current.position.y;

    // position from top of scrollarea to top of viewport
    const currentTop = state.top.current;

    // scrolls block at an increasing speed the farther it gets from
    // the viewport. It's speed and direction is given by the factor 
    ref.current.position.y = lerp(currentY,(currentTop/state.zoom)*factor,0.1);

    return (
      <>
        <offsetContext.Provider value={offset}>
          <group position={[0, -sectionHeight * offset * factor, 0]}>
            <group  ref={ref}>
              {children}
            </group>
          </group>
        </offsetContext.Provider>
      </>
    )
  });
}