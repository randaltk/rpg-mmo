import * as THREE from "three";

export function createSwordBladeGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.035, 0.02);
  shape.lineTo(0.03, 0.5);
  shape.lineTo(0.015, 0.58);
  shape.lineTo(0, 0.6);
  shape.lineTo(-0.015, 0.58);
  shape.lineTo(-0.03, 0.5);
  shape.lineTo(-0.035, 0.02);
  shape.lineTo(0, 0);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

export function createCrossGuardGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.02));
  points.push(new THREE.Vector2(0.015, -0.018));
  points.push(new THREE.Vector2(0.025, -0.01));
  points.push(new THREE.Vector2(0.028, 0));
  points.push(new THREE.Vector2(0.025, 0.01));
  points.push(new THREE.Vector2(0.015, 0.018));
  points.push(new THREE.Vector2(0, 0.02));
  return new THREE.LatheGeometry(points, 8);
}

export function createPommelGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.03));
  points.push(new THREE.Vector2(0.02, -0.025));
  points.push(new THREE.Vector2(0.035, -0.01));
  points.push(new THREE.Vector2(0.038, 0));
  points.push(new THREE.Vector2(0.035, 0.01));
  points.push(new THREE.Vector2(0.025, 0.02));
  points.push(new THREE.Vector2(0.01, 0.025));
  points.push(new THREE.Vector2(0, 0.028));
  return new THREE.LatheGeometry(points, 8);
}

export function createChestplateGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.32, -0.35);
  shape.quadraticCurveTo(-0.36, -0.1, -0.34, 0.15);
  shape.quadraticCurveTo(-0.3, 0.32, -0.15, 0.36);
  shape.quadraticCurveTo(0, 0.38, 0.15, 0.36);
  shape.quadraticCurveTo(0.3, 0.32, 0.34, 0.15);
  shape.quadraticCurveTo(0.36, -0.1, 0.32, -0.35);
  shape.lineTo(-0.32, -0.35);

  return new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 3,
  });
}

export function createShoulderPadGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.12));
  points.push(new THREE.Vector2(0.08, -0.1));
  points.push(new THREE.Vector2(0.14, -0.06));
  points.push(new THREE.Vector2(0.17, 0));
  points.push(new THREE.Vector2(0.16, 0.04));
  points.push(new THREE.Vector2(0.13, 0.07));
  points.push(new THREE.Vector2(0.06, 0.09));
  points.push(new THREE.Vector2(0, 0.1));
  return new THREE.LatheGeometry(points, 10);
}

export function createBootGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.07, 0);
  shape.lineTo(-0.08, 0.08);
  shape.quadraticCurveTo(-0.085, 0.15, -0.07, 0.18);
  shape.lineTo(0.07, 0.18);
  shape.quadraticCurveTo(0.085, 0.15, 0.08, 0.08);
  shape.lineTo(0.1, 0.02);
  shape.lineTo(0.12, 0);
  shape.lineTo(-0.07, 0);

  return new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
}
