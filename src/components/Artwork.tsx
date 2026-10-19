import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { CategoryId } from '../catalog/types';

/** Original vector catalogue illustrations; never presented as real product photography. */
export function ProductArt({
  category,
  size = 150,
}: {
  category: CategoryId | null;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      accessibilityLabel="Illustrative product artwork"
    >
      <Defs>
        <LinearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#B4BFBB" />
          <Stop offset=".35" stopColor="#F7F8F6" />
          <Stop offset=".7" stopColor="#DAE0DC" />
          <Stop offset="1" stopColor="#A9B5B0" />
        </LinearGradient>
        <LinearGradient id="white" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFF" />
          <Stop offset="1" stopColor="#D6DFD9" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="103" cy="167" rx="54" ry="8" fill="#233B2D" opacity=".08" />
      {category === 'hand-dryers' && (
        <G>
          <Rect x="49" y="35" width="109" height="115" rx="22" fill="#A9B6AF" />
          <Rect x="43" y="29" width="109" height="115" rx="22" fill="url(#metal)" />
          <Path d="M59 47 Q99 36 136 47" stroke="#FFF" strokeWidth="3" opacity=".8" fill="none" />
          <Rect x="60" y="110" width="76" height="20" rx="8" fill="#263E35" />
          <Rect x="65" y="110" width="66" height="6" rx="3" fill="#162B25" />
          <Circle cx="99" cy="91" r="3" fill="#488C68" />
          <Path
            d="M81 151v9m17-9v13m17-13v9"
            stroke="#8BA99A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>
      )}
      {category === 'soap-dispensers' && (
        <G>
          <Rect x="72" y="36" width="66" height="122" rx="16" fill="#AEBDB5" />
          <Rect x="65" y="31" width="66" height="122" rx="16" fill="url(#white)" />
          <Path d="M66 64h64" stroke="#B5C5BA" />
          <Rect x="89" y="76" width="17" height="44" rx="8" fill="#35574A" />
          <Rect x="93" y="81" width="4" height="30" rx="2" fill="#8CAB9B" />
          <Path d="M83 153h31l-5 8H88z" fill="#6F8679" />
          <Circle cx="98" cy="48" r="3" fill="#486C5A" />
        </G>
      )}
      {category === 'paper-towel-dispensers' && (
        <G>
          <Rect x="39" y="39" width="128" height="100" rx="8" fill="#93A69B" />
          <Rect x="33" y="34" width="128" height="100" rx="8" fill="url(#metal)" />
          <Circle cx="98" cy="48" r="3" fill="#698473" />
          <Rect x="83" y="68" width="28" height="5" rx="2" fill="#759183" />
          <Path d="M49 121h97v11H49z" fill="#2F4B3D" />
          <Path d="M66 128h65l-8 33-27-4-32 7z" fill="#FFF" />
          <Path d="M79 135l-4 20m42-20-4 16" stroke="#E5EAE4" strokeWidth="2" />
        </G>
      )}
      {category === 'sanitary-bins' && (
        <G>
          <Path d="M63 55h80l-9 107H71z" fill="url(#white)" />
          <Path d="M65 54h78l-6-16H71z" fill="#C7D3CA" />
          <Ellipse cx="104" cy="40" rx="32" ry="7" fill="#ECF0EB" />
          <Path d="M81 39h44v8H81z" fill="#405F4E" />
          <Path d="M127 66l-5 82" stroke="#C3CFC5" strokeWidth="3" />
          <Rect x="92" y="148" width="25" height="5" rx="2" fill="#84998B" />
        </G>
      )}
      {category === 'baby-change-stations' && (
        <G>
          <Rect x="25" y="37" width="150" height="111" rx="17" fill="#B7C6BC" />
          <Rect x="20" y="32" width="150" height="111" rx="17" fill="url(#white)" />
          <Rect
            x="31"
            y="44"
            width="128"
            height="81"
            rx="12"
            fill="none"
            stroke="#C0CCC2"
            strokeWidth="2"
          />
          <Path d="M73 86h44m-22-9v17" stroke="#8AA28E" strokeWidth="3" strokeLinecap="round" />
          <Circle cx="95" cy="66" r="7" fill="#8AA28E" />
          <Rect x="67" y="131" width="55" height="5" rx="2" fill="#668273" />
        </G>
      )}
      {category === 'grab-rails' && (
        <G>
          <Ellipse cx="45" cy="140" rx="18" ry="21" fill="url(#metal)" />
          <Ellipse cx="152" cy="55" rx="18" ry="21" fill="url(#metal)" />
          <Path
            d="M45 140V84q0-15 16-15h75q16 0 16-14"
            stroke="#99AAA0"
            strokeWidth="17"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M42 138V82q0-15 16-15h75q16 0 16-14"
            stroke="url(#metal)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      )}
      {!category && (
        <G>
          <Rect x="48" y="49" width="105" height="105" rx="12" fill="url(#white)" />
          <Path d="M48 74h105M100 50v104" stroke="#BBCABF" strokeWidth="2" />
        </G>
      )}
    </Svg>
  );
}

export function BathroomArt() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 500 390"
      preserveAspectRatio="xMidYMid slice"
      accessibilityLabel="Illustration of a contemporary green washroom"
    >
      <Defs>
        <LinearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E6EADD" />
          <Stop offset="1" stopColor="#BDCABC" />
        </LinearGradient>
        <LinearGradient id="cabinet" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#447461" />
          <Stop offset="1" stopColor="#234E40" />
        </LinearGradient>
        <LinearGradient id="mirror" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#A4B7A9" />
          <Stop offset=".5" stopColor="#DCE6D8" />
          <Stop offset="1" stopColor="#BACCC0" />
        </LinearGradient>
      </Defs>
      <Rect width="500" height="390" fill="url(#wall)" />
      {Array.from({ length: 10 }, (_, i) => (
        <Path key={`v${i}`} d={`M${i * 58} 0v390`} stroke="#FFFFFF" opacity=".3" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Path key={`h${i}`} d={`M0 ${i * 58}h500`} stroke="#FFFFFF" opacity=".3" />
      ))}
      <Path d="M0 349h500v41H0z" fill="#B2B8A9" />
      <Path d="M0 349h500" stroke="#8F9F8C" />
      <Rect x="95" y="-40" width="208" height="242" rx="100" fill="#7E9481" />
      <Rect x="101" y="-36" width="196" height="232" rx="96" fill="url(#mirror)" />
      <Path d="M138 0v151M145 0v148" stroke="#F5F7EC" strokeWidth="4" opacity=".35" />
      <Rect x="65" y="259" width="274" height="112" fill="url(#cabinet)" />
      {Array.from({ length: 25 }, (_, i) => (
        <Path
          key={i}
          d={`M${72 + i * 10.6} 264v103`}
          stroke="#173D30"
          opacity=".3"
          strokeWidth="2"
        />
      ))}
      <Rect x="52" y="246" width="300" height="16" rx="3" fill="#EFF0E3" />
      <Ellipse cx="199" cy="245" rx="79" ry="13" fill="#FAFBEF" />
      <Path d="M128 240q5 35 71 35t71-35" fill="#E8EBDC" />
      <Ellipse cx="199" cy="240" rx="71" ry="13" fill="#FFFDF0" />
      <Ellipse cx="199" cy="239" rx="52" ry="6" fill="#D2DACB" />
      <Path d="M202 231v-31q0-17 17-17h13v10h-12q-7 0-7 8v30z" fill="#526D5B" />
      <Rect x="282" y="211" width="23" height="32" rx="5" fill="#D1D6BD" />
      <Path d="M294 210v-7h12" stroke="#4A6552" strokeWidth="4" fill="none" />
      <Rect x="355" y="118" width="56" height="76" rx="9" fill="#D5DED2" />
      <Rect x="350" y="115" width="56" height="76" rx="9" fill="#ECF0E6" />
      <Rect x="359" y="167" width="37" height="13" rx="5" fill="#496452" />
      <Circle cx="379" cy="153" r="2" fill="#51775B" />
      <Path
        d="M445 286q-7-95 12-139m-10 98q-33-17-31-43 24 2 31 43m3-45q-16-29-7-48 18 14 7 48m-5 70q27-10 33-37-26-1-33 37m10-91q23-8 24-30-23 4-24 30"
        fill="#5D7B4E"
      />
      <Path d="M428 281h43l-7 64h-29z" fill="#C9B497" />
    </Svg>
  );
}
