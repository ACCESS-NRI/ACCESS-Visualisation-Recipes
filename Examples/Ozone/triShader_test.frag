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
in float vWaterlevel;

out vec4 outColour;

uniform bool uCalcNormal;

uniform mat4 uNMatrix;

void calcColour(vec3 colour, float alpha)
{
  //Brightness adjust
  colour += uBrightness;
  //Saturation & Contrast adjust
  const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
  vec3 AvgLumin = vec3(0.5, 0.5, 0.5);
  vec3 intensity = vec3(dot(colour, LumCoeff));
  colour = mix(intensity, colour, uSaturation);
  colour = mix(AvgLumin, colour, uContrast);

  //Gamma correction
  //https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model#OpenGL_Shading_Language_code_sample
  //const float screenGamma = 2.2; // Assume the monitor is calibrated to the sRGB color space
  //vec3 colorGammaCorrected = pow(color, vec3(1.0 / screenGamma));

  outColour = vec4(colour, alpha);
}

void main(void)
{
  vec4 fColour = vColour;

  //fColour = 1.0 - fColour;
  float alpha = 1.0; //fColour.a;

    //With this blending mode, texture is blended over base colour,
    //and colour opacity has no effect on texture opacity
    //All desired texture opacity must be built in to the texture data
    //(Could add another blend mode if we want a dynamic texture opacity)
    vec4 tColour = texture(uTexture, vTexCoord);

      //Additive blend alpha channel
      alpha = fColour.a + tColour.a * (1.0 - fColour.a);

      //Blend the texure colour with the fragment colour using texture alpha
      fColour.rgb = vec3(mix(fColour.rgb, tColour.rgb, tColour.a));

  //Reduce the contrast to shades of grey
  //fColour = 1.0 - fColour;
  //CONTRAST ENHANCE
  //fColour = 1.2 * fColour - 0.2;
  //fColour = 1.2 * fColour - 0.25;
  fColour = 1.5 * fColour - 0.5;
  //fColour = 1.0 - fColour;
  outColour = fColour; //vec4(, alpha);

  //float lon = vTexCoord.x * 360.0;
  //if (int(lon) % 10 == 0)
  //  outColour.r = 1.0;
  //float lat = vTexCoord.y * 360.0 - 180;

  outColour.a = 1.0; //alpha;
  alpha = 1.0; //alpha;
  //return;

  vec3 lightColour = uLight.xyz;
  
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

  //Final colour - diffuse + ambient only
  calcColour(lightColour * fColour.rgb * (uAmbient + diffuse * uDiffuse), alpha);

}

