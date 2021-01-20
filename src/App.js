import './App.css';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useRef, useEffect, Suspense, useCallback } from 'react';
import useEventListener from './hooks/useEventListener';
import { useGLTF } from '@react-three/drei/useGLTF';
import { OrbitControls } from '@react-three/drei/OrbitControls'
import {Canvas, useLoader, useThree, useFrame} from 'react-three-fiber';


import state from './store'; 
import { Box3, Sphere, Vector2, Mesh, DoubleSide } from 'three';
import lerp from './util/lerp';


function Model() {
    const gltf  = useGLTF('./model/Wolf-Blender-2.82a.glb', true);
  return <primitive object={gltf.scene} position={[0, 0, 0]} />;
}

function Content(){
  const ref = useRef();
  const groupArray = [];
  const NUM_PLANES = 40;
  const {viewport} = useThree();
  const spacing = viewport/NUM_PLANES;
  
 

  useEffect(()=> {
    if(ref.current) {
      centerGroup(ref.current);
    }
  }, []);

  for(let j=0; j<NUM_PLANES; j++){ // columns
    const rotation = lerp(3*Math.PI,-3*Math.PI, j/NUM_PLANES) + Math.PI/2;
    for(let i=0; i<NUM_PLANES; i++) { // rows
      groupArray.push(<Plane args={[2,1]} color='green' position={[j*5,i*5,0]} rotation={[0,rotation,0]}/>)
    }
  }

  let group = <group ref={ref}>{groupArray}</group>;


  return group;
}

function centerGroup(group) {
  if (!group) return;
  const boundingBox = new Box3().setFromObject(group);
  const {center} = boundingBox.getBoundingSphere(new Sphere());

  group.traverse((child) => {
    if (child instanceof Mesh){
      child.geometry.position = child.position.sub(center);
    }
  })
}

function Plane({args, color='black', opacity, ...props}){
  const ref = useRef();
  
useFrame(
    () => {
      if (ref.current && state.mousemove_x.current) {
        ref.current.rotation.y = ref.current.rotation.y + state.mousemove_x.current*Math.PI/2;
      }
    }
  );


  return (
    <mesh ref={ref} {...props}>
      <planeBufferGeometry attach="geometry" args={args}/>
      <meshLambertMaterial attach="material" transparent={!!opacity} opacity={!!opacity ? opacity : 1} color={color} side={DoubleSide}/>
    </mesh>
  );
}

function Box({l=1,w=1,h=1, material}) {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[l, w, h]} />
      {material ? material:<meshStandardMaterial attach="material" />}
    </mesh>
  )
}


function App() {
  const scrollArea = useRef();
  const onScroll = e => (state.top.current = e.target.scrollTop);

  const onMouseMoveHandler = useCallback(
    (e) => {
      const { clientX, clientY } = e;
      if (state.mousePosition.current) {
        if (state.mousePosition.current.x !== clientX) {
          state.mousemove_x.current = ((clientX / window.innerWidth) * 2 - 1) - state.mousePosition.current.x;
        } else {
          state.mousemove_x.current = 0;
        }
        // normalized for uv coordinates (1 to -1)
        state.mousePosition.current.x = (clientX / window.innerWidth) * 2 - 1;
        state.mousePosition.current.y = -(clientY / window.innerHeight) * 2 + 1;
      } else {
        state.mousePosition.current = new Vector2();
      }
    },
    []
  );

  useEventListener('mousemove', onMouseMoveHandler);

  useEffect(() => void onScroll({target:scrollArea.current}), []);
  return (
    <>
      <Canvas orthographic camera={{ zoom:10, position: [0, 0, 600] }}>
        <Suspense fallback={<Box />}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 10]} intensity={4} />
          <pointLight position={[-5, -5, 10]} intensity={4} />
          <Content />
        </Suspense>
      </Canvas>
      <Canvas></Canvas>
      <div ref={scrollArea} onScroll={onScroll} className='scroll-area'>
        <div style={{ height: `${2 * 100}vh` }} />
      </div>
    </>
  );
}
export default App;
