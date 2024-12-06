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

#define isnan3(v) any(isnan(v))
flat in vec4 vFlatColour;
uniform bool uFlat;
out vec4 outColour;

uniform bool uCalcNormal;

uniform sampler2D ice10;
uniform sampler2D ice20;
uniform sampler2D ice30;
uniform sampler2D ice40;
uniform sampler2D ice50;
uniform sampler2D ice60;
uniform sampler2D ice70;
uniform sampler2D ice80;
uniform sampler2D ice90;
uniform sampler2D ice100;
uniform float uTime;
uniform int uFrame;

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

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(void)
{
  //Clip planes in X/Y/Z
  if (any(lessThan(vVertex, uClipMin)) || any(greaterThan(vVertex, uClipMax))) discard;

  vec4 fColour = vColour;
  if (uFlat)
    fColour = vFlatColour;
  float alpha = fColour.a;
  if (uTextured && vTexCoord.x > -1.0) //Null texcoord (-1,-1)
  {
    //With this blending mode, texture is blended over base colour,
    //and colour opacity has no effect on texture opacity
    //All desired texture opacity must be built in to the texture data
    //(Could add another blend mode if we want a dynamic texture opacity)
    vec4 tColour = texture(uTexture, vTexCoord);
    fColour = tColour;
    alpha = tColour.a;
  }

  //Sea ice mask / transparency
//  float L = fColour.r; //(0.2126*fColour.r + 0.7152*fColour.g + 0.0722*fColour.b);
  //fColour.rgb = vec3(fColour.r, 0.9, 1.0);
  //alpha = L;
//  alpha = L;
  //alpha = pow(L,1.5);
  //alpha = L;
  //if (L < 0.3)
  //  alpha = L*L; //0.0; //sqrt(L);
  //else
  //  alpha = L + 0.2; // + 0.3; //sqrt(L);
  //fColour.rgb *= alpha;

  //Dither with random instead of alpha fade
//  if (alpha < 0.98 && random(vVertex.xy * alpha) > alpha)
//    discard;
  //else
  //  alpha = 1.0;
//  fColour.g = 0.1 + sqrt(alpha);
//  fColour.b = 0.01 + sqrt(alpha); //fColour.g = sqrt(alpha);

alpha = fColour.r;
  if (uOpacity > 0.0) alpha *= uOpacity;
  if (uOpaque) alpha = 1.0;
  if (alpha < 0.01) discard;
//vec2 uv = vTexCoord;
    //Repeated tiling using normal as texcoord
    vec3 NN = normalize(vVertex);
    //NN = 3D coord on the unit sphere
    float latitude = acos(NN.z);
    float longitude = atan(NN.x, NN.y);
    vec2 uv = vec2(latitude, longitude);


//Best for low conc
    //uv = uv * 40.0 + 0.05 * uTime * 0.01;
    uv = uv * 40.0 + 0.05 * float(uFrame) * 0.001;
    //uv = fract(uv * 40.0 + 0.05 * random(uv)*alpha + uTime * 0.01);
//   uv = fract(uv * 100.0); // + uTime * 0.01); // + 0.025 * random(vVertex.xy));

//Best for high conc
//vec2 uvh =
//fract(uv * 5.0*pow(alpha+0.5,1.5) + uTime * 0.01 + 0.025 * random(vVertex.xy));
// fract(uv * 10*(1.0-alpha*0.5) + uTime * 0.01); // + 0.025 * random(vVertex.xy));
// fract(uv * 3.0*(alpha+0.5) + uTime * 0.01 + 0.05 * random(vVertex.xy));
// fract(uv * 0.5*(random(vVertex.xy * alpha)) + uTime * 0.01);

//uv = mix(uv, uvh, pow(alpha, 10));

if (alpha > 0.0 && alpha < 0.1)
  fColour = texture(ice10, uv); //Good except large ice berg
else if (alpha >= 0.1 && alpha < 0.2)
  fColour = texture(ice20, uv); //Good
else if (alpha >= 0.2 && alpha < 0.3)
  fColour = texture(ice30, uv);  //Also v bad - better now but gap too large at left/right edge
else if (alpha >= 0.3 && alpha < 0.4)
  fColour = texture(ice40, uv); //Really bad mirrored - still really bad, not even enough 
else if (alpha >= 0.4 && alpha < 0.5)
  fColour = texture(ice50, uv); //L/R perfect - T/B bad - better
else if (alpha >= 0.5 && alpha < 0.6)
  fColour = texture(ice60, uv); //Nice but bad left/right edge
else if (alpha >= 0.6 && alpha < 0.7)
  fColour = texture(ice70, uv);    //OK
else if (alpha >= 0.7 && alpha < 0.8)
  fColour = texture(ice80, uv);
else if (alpha >= 0.8 && alpha < 0.9)
  fColour = texture(ice90, uv);
else if (alpha >= 0.9)
  fColour = texture(ice100, uv);


float L = (0.2126*fColour.r + 0.7152*fColour.g + 0.0722*fColour.b);
alpha = max(L, alpha);

  if (!uLighting) 
  {
    calcColour(fColour.rgb, alpha);
    return;
  }

  vec3 lightColour = uLight.xyz;
  
  //Light direction
  vec3 lightDir = normalize(vLightPos - vPosEye);

  //Calculate diffuse lighting
  vec3 N = normalize(vNormal);

  //Default normal...
  if (true) //uCalcNormal || dot(N,N) < 0.01 || isnan3(N))
  {
    //Requires extension in WebGL: OES_standard_derivatives
    vec3 fdx = vec3(dFdx(vPosEye.x),dFdx(vPosEye.y),dFdx(vPosEye.z));    
    vec3 fdy = vec3(dFdy(vPosEye.x),dFdy(vPosEye.y),dFdy(vPosEye.z));
    N = normalize(cross(fdx,fdy)); 
  }

  //Modified to use energy conservation adjustment
  //https://learnopengl.com/Advanced-Lighting/Advanced-Lighting
  const float kPi8 = 3.14159265 * 8.0;

  //Calculate diffuse component
  //Single side or two-sided lighting with abs()?
  float diffuse = dot(N, lightDir);
  if (uLight.w < 0.5)
    diffuse = abs(diffuse);
  else
    diffuse = max(diffuse, 0.0);

  //Compute the specular term
  if (diffuse > 0.0 && uSpecular > 0.0)
  {
    //Specular power, higher is more focused/shiny
    float shininess = 256.0 * clamp(uShininess, 0.0, 1.0);
    vec3 specolour = lightColour; //Color of light - use the same as diffuse/ambient
    //Blinn-Phong
    vec3 viewDir = normalize(-vPosEye);
    //Normalize the half-vector
    vec3 halfVector = normalize(lightDir + viewDir);

    //Compute cosine (dot product) with the normal
    float NdotHV = dot(N, halfVector);
    //Single side or two-sided lighting with abs()?
    if (uLight.w < 0.5)
      NdotHV = abs(NdotHV);
    else
      NdotHV = max(NdotHV, 0.0);

    //Energy conservation adjustment (more focused/shiny highlight will be brighter)
    float energyConservation = ( 8.0 + shininess) / kPi8;
    //Multiplying specular by diffuse prevents bands at edges for low shininess
    float spec = diffuse * uSpecular * energyConservation * pow(NdotHV, shininess);

    //Final colour - specular + diffuse + ambient
    calcColour(lightColour * (fColour.rgb * (uAmbient + uDiffuse * diffuse) + vec3(spec)), alpha);
  }
  else
    //Final colour - diffuse + ambient only
    calcColour(lightColour * fColour.rgb * (uAmbient + diffuse * uDiffuse), alpha);
}

