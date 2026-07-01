import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: 'center',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <h1 style={{fontSize: 72, margin: 0, fontWeight: 700}}>Hello, Remotion!</h1>
        <p style={{fontSize: 32, marginTop: 16, opacity: 0.7}}>Frame {frame}</p>
      </div>
    </AbsoluteFill>
  );
};
