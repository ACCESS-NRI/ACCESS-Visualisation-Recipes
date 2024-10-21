in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColour;
in vec2 aVertexTexCoord;
#ifndef WEBGL
flat out vec4 vFlatColour;
#endif

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec4 uColour;
uniform vec4 uLightPos;

out vec4 vColour;
out vec3 vNormal;
out vec3 vPosEye;
out vec2 vTexCoord;
out vec3 vVertex;
out vec3 vLightPos;

out vec3 vNormal2;

uniform float uTime;
uniform int uFrame;

//Custom 
uniform float height;
out float vWaterlevel;

#define PI 3.14159265

uniform sampler2D uTexture;

float rand(vec2 co)
{
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void)
{
  vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);

  if (uColour.a > 0.0)
    vColour = uColour;
  else
    vColour = aVertexColour;

  vTexCoord = aVertexTexCoord;
#ifndef WEBGL
  vFlatColour = vColour;
#endif
  vVertex = aVertexPosition;

  //Head light, lightPos=(0,0,0) - vPosEye
  //vec3 lightDir = normalize(uLightPos.xyz - vPosEye);
  if (uLightPos.w < 0.5)
  {
    //Light follows camera - default mode
    vLightPos = uLightPos.xyz;
  }
  else
  {
    //Fixed Scene Light, when lightpos.w set to 1.0
    vLightPos = (uMVMatrix * vec4(uLightPos.xyz, 1.0)).xyz;
  }

  //Once water > set depth, straighten normals
  float vlen = length(aVertexPosition);
  //WTF? fudge factor fixes the moire / spotting
  vWaterlevel = height - vlen; // + 0.000005;

  //Flatten water coloured vertices to avoid coastline artifacts
  //where topo and relief texture don't align perfectly
  vec3 vertexNormal = aVertexNormal;
  //Need to lookup the texture to get relief colour
  if (vTexCoord.x > -1.0) //Null texcoord (-1,-1)
  {
    vColour = texture(uTexture, vTexCoord);
    bool water = (vColour.z > 0.5 && vColour.x < 0.3 && vColour.y > 0.3);
    if (water) // || vWaterlevel > 0.000005)
    {
      //Flatten vertex and normal
      vec3 N = normalize(aVertexPosition);
      vec3 vert = N * height;
      mvPosition = uMVMatrix * vec4(vert, 1.0);
      vertexNormal = N;
      vColour = vec4(0., 0., 0., 1.);
    }
  }

  vPosEye = vec3(mvPosition) / mvPosition.w;
  gl_Position = uPMatrix * mvPosition;

  vNormal = normalize(mat3(uNMatrix) * vertexNormal);
  vNormal2 = normalize(vec3(mvPosition));
}

