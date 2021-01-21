import './App.css';
import { useRef, useEffect, Suspense } from 'react';
import useEventListener from './hooks/useEventListener';
import { useGLTF } from '@react-three/drei/useGLTF';
import {Canvas, useFrame} from 'react-three-fiber';


import state from './store'; 
import { Box3, Sphere, Vector2, Mesh, DoubleSide } from 'three';
import utils from './util/index';

const {normalize} = utils;

function Model() {
  const gltf  = useGLTF('./model/Wolf-Blender-2.82a.glb', true);
  return <primitive object={gltf.scene} position={[0, 0, 0]} />;
}

function Content() {
  const ref = useRef();
  const groupArray = [];
  const aspectRatio = window.innerWidth / window.innerHeight;
  const numRows = 30;
  const numCol = Math.round(numRows*aspectRatio);
  const planeOffset = 5;
  const planeWidth = 2;
  const planeHeight = 2;
  
  useEffect(()=> {
    if(ref.current) {
      centerGroup(ref.current);
    }
  }, []);

  for(let k =0; k<4; k++) {
    for(let j=0; j<numCol; j++){ // columns
      for(let i=0; i<numRows; i++) { // rows
        const x_position = j*planeOffset+ (k%2?-1:1)*k+(Math.random()*10-5);
        groupArray.push(
          <Plane 
            args={[planeWidth,planeHeight]} 
            color='green' 
            position={[x_position,i*planeOffset,k*10]}
            rotation={[0,Math.PI,k*Math.PI/4]}
            opacity={0.2}
          />)
        }
    }
  }
  return <group ref={ref}>{groupArray}</group>;
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
  const plane = useRef();

  useFrame(()=> {
    if (plane.current && state.mousePosition.current) {
      const relativePositionX = 
        state.mousePosition.current.x -
        normalize(plane.current.position.x*state.zoom, window.innerWidth);

        const relativePositionY = 
        state.mousePosition.current.y -
        normalize(plane.current.position.y*state.zoom, window.innerHeight);

      if (state.mousemove.current) {
          plane.current.rotation.y = (relativePositionY)*Math.PI/2;
          plane.current.rotation.x = (1-relativePositionX)*Math.PI/2;
          // plane.current.rotation.z = ((relativePositionY+relativePositionY)*.5)*Math.PI/2;
      }
    }
  });

  return (
    <mesh ref={plane} {...props}>
      <planeBufferGeometry attach="geometry" args={args}/>
      <meshLambertMaterial 
        attach="material" 
        transparent={!!opacity} 
        opacity={!!opacity ? opacity : 1} 
        color={color} 
        side={DoubleSide}
      />
    </mesh>
  );
}

function Box({l=1,w=1,h=1, material}) {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[l, w, h]} />
      {material ? material:<meshStandardMaterial attach="material" />}
    </mesh>
  );
}



function BackDrop() {
  return (
    <mesh receiveShadow position={[0, -1, -5]}>
      <planeBufferGeometry attach="geometry" args={[500, 500]} />
      <meshStandardMaterial attach="material" color="black" />
    </mesh>
  );
}


function App() {
  const scrollArea = useRef();
  const onScroll = e => (state.top.current = e.target.scrollTop);
  let timeout;

  const onMouseMove = (e) => {
    clearTimeout(timeout,300);
    timeout = setTimeout(() => {
      state.mousemove.current = false;
    });
      const { clientX, clientY } = e;
      if (state.mousePosition.current) {
          state.mousemove.current = true;
          state.mousePosition.current.x = normalize(clientX, window.innerWidth);
          state.mousePosition.current.y = -1* normalize(clientY, window.innerHeight)
      } else {
        state.mousePosition.current = new Vector2();
      }
  }

  useEventListener('mousemove', onMouseMove);

  useEffect(() => void onScroll({target:scrollArea.current}), []);
  return (
    <>
      <Canvas background="#000000" orthographic camera={{ zoom: state.zoom, position: [20, 50, 200] }}>
        <Suspense fallback={<Box />}>
          <BackDrop/>
          <ambientLight intensity={0.8} />
          {/* <pointLight position={[5, 5, 10]} intensity={6} /> */}
          {/* <pointLight position={[-5, -5, 10]} intensity={6} /> */}
          <Content/>
        </Suspense>
      </Canvas>
      <div ref={scrollArea} onScroll={onScroll} className='scroll-area'>
        <div style={{ height: `${2 * 100}vh` }} />
      </div>
    </>
  );
}
export default App;
