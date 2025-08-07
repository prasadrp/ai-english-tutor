import React from 'react';
import Svg, { Line, Polygon } from 'react-native-svg';
import { styled } from 'nativewind';

const StyledSvg = styled(Svg);
const StyledLine = styled(Line);
const StyledPolygon = styled(Polygon);

interface IconProps {
    className?: string;
}

const SoundOffIcon: React.FC<IconProps> = ({ className }) => {
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
      <StyledPolygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></StyledPolygon>
      <StyledLine x1="23" y1="9" x2="17" y2="15"></StyledLine>
      <StyledLine x1="17" y1="9" x2="23" y2="15"></StyledLine>
    </StyledSvg>
  );
};

export default SoundOffIcon;
