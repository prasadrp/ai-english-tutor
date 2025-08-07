import React from 'react';
import Svg, { Line, Polygon } from 'react-native-svg';
import { styled } from 'nativewind';

const StyledSvg = styled(Svg);
const StyledLine = styled(Line);
const StyledPolygon = styled(Polygon);

interface IconProps {
    className?: string;
}

const SendIcon: React.FC<IconProps> = ({ className }) => {
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
      <StyledLine x1="22" y1="2" x2="11" y2="13"></StyledLine>
      <StyledPolygon points="22 2 15 22 11 13 2 9 22 2"></StyledPolygon>
    </StyledSvg>
  );
};

export default SendIcon;
