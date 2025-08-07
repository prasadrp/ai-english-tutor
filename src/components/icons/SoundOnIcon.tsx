import React from 'react';
import Svg, { Path, Polygon } from 'react-native-svg';
import { styled } from 'nativewind';

const StyledSvg = styled(Svg);
const StyledPath = styled(Path);
const StyledPolygon = styled(Polygon);

interface IconProps {
    className?: string;
}

const SoundOnIcon: React.FC<IconProps> = ({ className }) => {
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
      <StyledPath d="M15.54 8.46a5 5 0 0 1 0 7.07"></StyledPath>
      <StyledPath d="M19.07 4.93a10 10 0 0 1 0 14.14"></StyledPath>
    </StyledSvg>
  );
};

export default SoundOnIcon;
