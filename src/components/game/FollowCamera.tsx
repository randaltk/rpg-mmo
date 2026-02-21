"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const DEFAULT_YAW = 0;
const DEFAULT_PITCH = 0.6;
const DEFAULT_DISTANCE = 10;

interface FollowCameraProps {
  target: { x: number; y: number; z: number };
}

export default function FollowCamera({ target }: FollowCameraProps) {
  const { camera, gl } = useThree();
  const yaw = useRef(DEFAULT_YAW);
  const pitch = useRef(DEFAULT_PITCH);
  const distance = useRef(DEFAULT_DISTANCE);
  const isDragging = useRef(false);
  const smoothPos = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    (window as any).__cameraYaw = yaw;
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) isDragging.current = true;
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      yaw.current -= e.movementX * 0.005;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - e.movementY * 0.005,
        0.1,
        Math.PI / 2 - 0.05
      );
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      distance.current = THREE.MathUtils.clamp(
        distance.current + e.deltaY * 0.01,
        3,
        20
      );
    };
    const onDblClick = () => {
      yaw.current = DEFAULT_YAW;
      pitch.current = DEFAULT_PITCH;
      distance.current = DEFAULT_DISTANCE;
    };
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDblClick);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDblClick);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const d = distance.current;
    const p = pitch.current;
    const y = yaw.current;

    const desiredPos = new THREE.Vector3(
      target.x + d * Math.sin(y) * Math.cos(p),
      target.y + d * Math.sin(p),
      target.z + d * Math.cos(y) * Math.cos(p)
    );

    const lerpFactor = 1 - Math.pow(0.02, delta);
    smoothPos.current.lerp(desiredPos, lerpFactor);
    camera.position.copy(smoothPos.current);

    const desiredLook = new THREE.Vector3(target.x, target.y + 1, target.z);
    lookTarget.current.lerp(desiredLook, lerpFactor);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
