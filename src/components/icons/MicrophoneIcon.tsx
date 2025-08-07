import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';
import { styled } from 'nativewind';

const StyledSvg = styled(Svg);
const StyledPath = styled(Path);
const StyledLine = styled(Line);

interface IconProps {
    className?: string;
}

const MicrophoneIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <StyledSvg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <StyledPath d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></StyledPath>
      <StyledPath d="M19 10v2a7 7 0 0 1-14 0v-2"></StyledPath>
      <StyledLine x1="12" y1="19" x2="12" y2="23"></StyledLine>
    </StyledSvg>
  );
};

export default MicrophoneIcon;
