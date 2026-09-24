import type { MotionLevel, MotionType, FocalPoint } from '../types';

export interface MotionStyleConfig {
  startTransform: string;
  endTransform: string;
  transformOrigin: string;
  animationDuration: string;
  transitionTimingFunction: string;
}

const MOTION_VARIATIONS: MotionType[] = [
  'zoomIn',
  'zoomOut',
  'panLeft',
  'panRight',
  'panUp',
  'panDown',
  'float'
];

export class MotionEngine {
  /**
   * Pick a random motion type
   */
  public getRandomMotionType(): MotionType {
    const idx = Math.floor(Math.random() * MOTION_VARIATIONS.length);
    return MOTION_VARIATIONS[idx];
  }

  /**
   * Generate CSS transform parameters for smooth GPU Ken Burns effect
   */
  public getMotionParams(
    motionType: MotionType,
    motionLevel: MotionLevel,
    durationSec: number,
    focalPoint?: FocalPoint
  ): {
    start: { scale: number; x: number; y: number };
    end: { scale: number; x: number; y: number };
    origin: string;
    duration: number;
  } {
    if (motionLevel === 'off') {
      return {
        start: { scale: 1.0, x: 0, y: 0 },
        end: { scale: 1.0, x: 0, y: 0 },
        origin: '50% 50%',
        duration: durationSec
      };
    }

    // Determine scale magnitude
    let baseScale = 1.03;
    let maxScale = 1.08;
    let panMagnitude = 1.2;

    if (motionLevel === 'subtle') {
      baseScale = 1.02;
      maxScale = 1.05;
      panMagnitude = 0.8;
    } else if (motionLevel === 'dynamic') {
      baseScale = 1.05;
      maxScale = 1.13;
      panMagnitude = 2.2;
    }

    // Focal point integration
    const fx = focalPoint ? Math.round(focalPoint.x * 100) : 50;
    const fy = focalPoint ? Math.round(focalPoint.y * 100) : 50;
    const origin = `${fx}% ${fy}%`;

    let start = { scale: baseScale, x: 0, y: 0 };
    let end = { scale: maxScale, x: 0, y: 0 };

    switch (motionType) {
      case 'zoomIn':
        start = { scale: baseScale, x: -panMagnitude * 0.3, y: -panMagnitude * 0.3 };
        end = { scale: maxScale, x: panMagnitude * 0.3, y: panMagnitude * 0.3 };
        break;
      case 'zoomOut':
        start = { scale: maxScale, x: panMagnitude * 0.3, y: panMagnitude * 0.3 };
        end = { scale: baseScale, x: -panMagnitude * 0.3, y: -panMagnitude * 0.3 };
        break;
      case 'panLeft':
        start = { scale: (baseScale + maxScale) / 2, x: panMagnitude, y: 0 };
        end = { scale: (baseScale + maxScale) / 2, x: -panMagnitude, y: 0 };
        break;
      case 'panRight':
        start = { scale: (baseScale + maxScale) / 2, x: -panMagnitude, y: 0 };
        end = { scale: (baseScale + maxScale) / 2, x: panMagnitude, y: 0 };
        break;
      case 'panUp':
        start = { scale: (baseScale + maxScale) / 2, x: 0, y: panMagnitude };
        end = { scale: (baseScale + maxScale) / 2, x: 0, y: -panMagnitude };
        break;
      case 'panDown':
        start = { scale: (baseScale + maxScale) / 2, x: 0, y: -panMagnitude };
        end = { scale: (baseScale + maxScale) / 2, x: 0, y: panMagnitude };
        break;
      case 'float':
      default:
        start = { scale: baseScale, x: -panMagnitude * 0.5, y: panMagnitude * 0.3 };
        end = { scale: maxScale, x: panMagnitude * 0.5, y: -panMagnitude * 0.3 };
        break;
    }

    return {
      start,
      end,
      origin,
      duration: durationSec
    };
  }
}

export const motionEngine = new MotionEngine();
