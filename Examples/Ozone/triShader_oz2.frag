in vec4 vColour;
in vec3 vNormal;
in vec3 vPosEye;
in vec3 vVertex;
in vec2 vTexCoord;
in vec3 vLightPos;

uniform float uOpacity;
uniform bool uLighting;
uniform float uBrightness;
uniform float uContrast;
uniform float uSaturation;
uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;
uniform float uShininess;

uniform bool uTextured;
uniform sampler2D uTexture;
uniform vec3 uClipMin;
uniform vec3 uClipMax;
uniform bool uOpaque;
uniform vec4 uLight;

//Custom 
uniform float height;

out vec4 outColour;

uniform bool uCalcNormal;

uniform mat4 uNMatrix;
float sat = uSaturation;

void calcColour(vec3 colour, float alpha)
{
  //Brightness adjust
  colour += uBrightness;
  //Saturation & Contrast adjust
  const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
  vec3 AvgLumin = vec3(0.5, 0.5, 0.5);
  vec3 intensity = vec3(dot(colour, LumCoeff));
  colour = mix(intensity, colour, sat);
  colour = mix(AvgLumin, colour, uContrast);

  outColour = vec4(colour, alpha);
}

void main(void)
{
  vec4 fColour = vColour;

  //fColour = 1.0 - fColour;
  float alpha = 1.0; //fColour.a;

  vec4 tColour = texture(uTexture, vTexCoord);
  //Blend the texure colour with the fragment colour using texture alpha
  fColour.rgb = tColour.rgb; //vec3(mix(fColour.rgb, tColour.rgb, tColour.a));

  //Light direction
  vec3 lightDir = normalize(vLightPos - vPosEye);
  //Calculate diffuse lighting
  vec3 N = normalize(vNormal);
  //Calculate diffuse component
  //Single side or two-sided lighting with abs()?
  float diffuse = dot(N, lightDir);
  if (uLight.w < 0.5)
    diffuse = abs(diffuse);
  else
    diffuse = max(diffuse, 0.0);

  //Reduce the opacity as ozone conc decreases
  alpha = clamp(0.4+ pow(tColour.a,2.0), 0.0, 1.0); //0.2 + alpha * fColour.a; //0.7; //uOpacity;
  //alpha = clamp(pow(tColour.a,1.25), 0.0, 1.0); //0.2 + alpha * fColour.a; //0.7; //uOpacity;
  //Crank the saturation to better show colours as opacity reduced
  sat = 1.3 + 1.0 - alpha;
  calcColour(fColour.rgb, alpha);
}

