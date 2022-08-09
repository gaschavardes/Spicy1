#include <defaultVert>

varying vec3 vNormal;
uniform float uSize;
varying vec3 vColor;

void main()	{

    vColor = color;
    
    gl_PointSize = uSize * clamp(position.z * 0.5, 0.8, 2.) ;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}