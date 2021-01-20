import { useContext } from 'react';
import {useThree} from 'react-three-fiber';
import state from '../store';

const { offsetContext } = state;

export default function useSection() {
  const { viewport } = useThree();
  const offset = useContext(offsetContext);
  const canvasWidth = viewport.width / state.zoom;
  const canvasHeight = viewport.height / state.zoom;
  const sectionHeight = canvasHeight * ((state.pages - 1) / (state.sections - 1));

  return {
    offset,
    canvasHeight,
    canvasWidth,
    sectionHeight,
  }
}