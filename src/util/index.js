const utils ={
  normalize: (a,b) => {
    return (a/b)*2 - 1;
  },
  lerp: (v0, v1, alpha) => {
    return ((v1-v0)*alpha + v0);
  },
}

export default utils;
