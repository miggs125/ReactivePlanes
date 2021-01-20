import { createRef, createContext } from 'react' 
import { Vector2 } from 'three';

const state = {
  sections: 3,
  top: createRef(),
  pages: 3,
  zoom: 75,
  offsetContext: createContext(0),
  mousemove_x: createRef(0),
  mousePosition: createRef(new Vector2())
}

export default state;