// Live state shared by the hero canvases: the arm writes it every frame, the signal monitor reads it.
export const telemetry = {
  biceps: 0.1,   // activation 0..1
  triceps: 0.1,  // activation 0..1
  flex: 0,       // elbow flexion 0 (straight) .. 1 (fully flexed)
  elbowVel: 0,   // smoothed elbow angular velocity, rad per frame (+ = flexing)
};
