in vec4 vColour;
in vec3 vNormal;
in vec3 vNormal2;
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

uniform float uTime;
uniform int uFrame;

//Custom 
uniform float height;
uniform sampler2D waves;
uniform sampler2D bathymetry;
uniform sampler2D bathymetry_blur;
in float vWaterlevel;

#define isnan3(v) any(isnan(v))
flat in vec4 vFlatColour;
uniform bool uFlat;
out vec4 outColour;

uniform bool uCalcNormal;

void calcColour(vec3 colour, float alpha, float brightness, float saturation, float contrast)
{
  //Brightness adjust
  colour += brightness;
  //Saturation & Contrast adjust
  const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
  vec3 AvgLumin = vec3(0.5, 0.5, 0.5);
  vec3 intensity = vec3(dot(colour, LumCoeff));
  colour = mix(intensity, colour, saturation);
  colour = mix(AvgLumin, colour, contrast);

  //Gamma correction
  //outColour = vec4(pow(colour, vec3(1.0 / uGamma)), alpha);

  outColour = vec4(colour, alpha);
}

float rand(vec2 co)
{
  return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}
uniform mat4 uNMatrix;

// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main(void)
{
  //Clip planes in X/Y/Z
  if (any(lessThan(vVertex, uClipMin)) || any(greaterThan(vVertex, uClipMax))) discard;

  //Random plot probability
  //if (rand(gl_FragCoord.xy * vTexCoord.xy) > 0.85) discard;

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
    if (fColour.a > 0.01)
    {
      //Additive blend alpha channel
      alpha = fColour.a + tColour.a * (1.0 - fColour.a);

      //Blend the texure colour with the fragment colour using texture alpha
      fColour.rgb = vec3(mix(fColour.rgb, tColour.rgb, tColour.a));
    }
    else
    {
      //Disable all blending if the base colour opacity <= 0.01
      fColour = tColour;
      alpha = tColour.a;
    }
  }

  if (uOpacity > 0.0) alpha *= uOpacity;
  if (uOpaque) alpha = 1.0;
  if (alpha < 0.01) discard;

  if (!uLighting) 
  {
    calcColour(fColour.rgb, alpha, uBrightness, uSaturation, uContrast);
    return;
  }

  vec3 lightColour = uLight.xyz;
  
  //Light direction
  vec3 lightDir = normalize(vLightPos - vPosEye);

  //Calculate diffuse lighting
  vec3 N = normalize(vNormal);

  //Modified to use energy conservation adjustment
  //https://learnopengl.com/Advanced-Lighting/Advanced-Lighting
  const float kPi8 = 3.14159265 * 8.0;

  //Custom - water blend
  //Compare vertex length to water height
  float vlen = length(vVertex);
  float waterlevel = vWaterlevel; //height - vlen;
  float specular = uSpecular;
  float shininess = uShininess;
  //vec3 wcol = vec3(0.33, 1.0, 1.0);
  //vec3 wcol = vec3(0.13, 0.5, 0.5);
  //vec3 wcol = vec3(0.15, 0.425, 0.4);
  //vec3 wcol = vec3(0.05, 0.075, 0.2);
  float brightness = uBrightness;
  float saturation = uSaturation;
  float contrast = uContrast;
  float diff = uDiffuse;
  //if (waterlevel > -0.002 && waterlevel <= -0.001)
  //{
  //  brightness = -0.075 * max(0.0, min(1.0 - (waterlevel+0.001) / -0.001, 1.0));
  //  saturation = 1.0 + 2.*brightness;
  //}


  vec3 hsv = rgb2hsv(fColour.xyz);
  //if (waterlevel >= 0.0 && fColour.z > 0.5 && fColour.x < 0.2)
  //if (waterlevel >= 0.0 && fColour.z > 0.3 && fColour.x < 0.3)
  //if (hsv.x > 230.0/360.0 && hsv.x < 280.0 / 360.0) // && hsv.z > 0.35 && hsv.z < 0.65)
  //if ((fColour.z > 0.5 && fColour.x < 0.3 && fColour.y > 0.3)) // || (fColour.x * fColour.y * fColour.z > 0.25))
  
  bool water = (fColour.z > 0.5 && fColour.x < 0.3 && fColour.y > 0.3);
  bool snow = (fColour.x * fColour.y * fColour.z > 0.4);

  if (water)
  //if (waterlevel >= 0.0)
  {

    vec2 coord = vTexCoord;
    coord.y = 1.0 - coord.y; //Flip vertically
    float depth = texture(bathymetry, coord).r;

      float depth2 = texture(bathymetry_blur, coord).r;
      depth = mix(depth, depth2, sqrt(1.0 - depth));


    vec3 c1 = vec3(0.1, pow(depth-0.1, 1.5)-0.1, depth);
    vec3 c2 = vec3(0, 124/255.0, 216/255.0);

    fColour.rgb = mix(c1, c2, sqrt(1.0-depth));

    saturation = 0.35;
    brightness = -0.05;
    contrast = 1.75;

    //vec3(0.1, pow(depth-0.1, 1.5)-0.2, pow(depth,1.5)-0.1);
    //Alpha, Bright, Sat, Cont
    //calcColour(fColour.rgb, 1.0, 0.0, 1.0, 0.5);
    //fColour = outColour;

    /*depth = log(depth+1.0);
    //fColour.rgb = vec3(0, 124/255.0, 216/255.0) * depth;
    float b = pow(depth, 0.5);
    float g = pow(depth, 1.5);
    if (depth < 0.5)
      g *= (depth*2.0);
    fColour.rgb = vec3(0.0, g, b) * 0.7 + 0.1;
    //  fColour.rgb = vec3(0, 124/255.0, 216/255.0) * 0.9;*/

    //Apply ocean texture
    //Repeated tiling using normal as texcoord
    vec3 NN = normalize(vVertex);
    //NN = 3D coord on the unit sphere
    float latitude = acos(NN.z);
    float longitude = atan(NN.x, NN.y);
    vec2 uv = vec2(latitude, longitude);
    //uv.y = 1.0 - uv.y;
    //Repeated tiling
    uv = fract(uv * 30.0 + float(uFrame) * 0.001);
    vec4 wavetex = texture(waves, uv);
    fColour.rgb = fColour.rgb * pow(wavetex.r, 0.4) + 0.1;
  }

  //if (water || snow)
  {
    //contrast = 1.25;
    //saturation = 0.35;
    float opacity = 0.0; //max(0.3, min(25.0*(waterlevel), 1.0));
    //float opacity = max(0.3, min(25.0*(waterlevel), 1.0));

    //float opacity = min(30.0*(waterlevel), 1.0);
    //wcol.y = 1.0 - opacity;
    //brightness = 1.5*opacity; //Milk
    //brightness = max(brightness - min(3.0*(waterlevel), 1.0), -0.1);
    //brightness = -0.05; //Darken terrain under water
    //saturation = max(saturation - min(10.0*(waterlevel), 1.0), 0.3);
    //saturation = 0.7;
    //diffuse = max(diffuse - min(3.0*(waterlevel), 1.0), 0.0);
    //diff = 1.0;
    //brightness = -0.1;
    //wcol = vec3(0.33, 0.8, 1.0) - vec3(brightness, brightness, brightness);
//    fColour.xyz = wcol; //mix(fColour.xyz, wcol, opacity);
    //fColour.xyz = mix(fColour.xyz, wcol, opacity);


    if (water && uSpecular > 0.0)
    {
      specular = 0.35; //0.55
      shininess = 0.065;
    }
    else if (uSpecular > 0.0)
    {
      specular = 0.4 * hsv.x; //0.5 * fColour.x * fColour.y * fColour.z; //0.5; //Max specular over water
      shininess = specular * 0.2;
    }
    //specular = 

  }

  //Calculate diffuse component
  //Single side or two-sided lighting with abs()?
  float diffuse = dot(N, lightDir);
  //if (uLight.w < 0.5)
  //  diffuse = abs(diffuse);
  //else
    diffuse = max(diffuse, 0.0);

  //SNOW IS TOO GLAREY - REDUCE LIGHTING
    if (snow && uSpecular > 0.0)
    {
      specular = 0.1;
      shininess = 0.05;
      diffuse = 0.65;
    }


  //Compute the specular term
  //if (diffuse > 0.0 && specular > 0.0)
  {
    //Specular power, higher is more focused/shiny
    float shininess = 256.0 * clamp(shininess, 0.0, 1.0);
    vec3 specolour = lightColour; //Color of light - use the same as diffuse/ambient
    //Blinn-Phong
    vec3 viewDir = normalize(-vPosEye);
    //Normalize the half-vector
    vec3 halfVector = normalize(lightDir + viewDir);

    //Use the adjusted normal for the specular component
    //Compute cosine (dot product) with the normal
    float NdotHV = dot(N, halfVector);
    //Single side or two-sided lighting with abs()?
    //if (uLight.w < 0.5)
    //  NdotHV = abs(NdotHV);
    //else
      NdotHV = max(NdotHV, 0.0);

    //Energy conservation adjustment (more focused/shiny highlight will be brighter)
    float energyConservation = ( 8.0 + shininess) / kPi8;
    //Multiplying specular by diffuse prevents bands at edges for low shininess
    //float spec = diffuse * specular * energyConservation * pow(NdotHV, shininess);
    float spec = specular * energyConservation * pow(NdotHV, shininess);

    //Final colour - specular + diffuse + ambient
    //calcColour(lightColour * (fColour.rgb * (uAmbient + diff * diffuse) + vec3(spec)), alpha, brightness, saturation, contrast);
    calcColour(lightColour * (fColour.rgb * (uAmbient + diff * diffuse) + vec3(spec)), alpha, brightness, saturation, contrast);
  }
  //else
    //Final colour - diffuse + ambient only
    //calcColour(lightColour * fColour.rgb * (uAmbient + diffuse * uDiffuse), alpha, brightness, saturation, contrast);

/*/ Fog parameters, could make them uniforms and pass them into the fragment shader
float fog_maxdist = 15.0;
float fog_mindist = 0.1;
vec4  fog_colour = vec4(0.4, 0.4, 0.4, 1.0);

// Calculate fog
float dist = length(vVertex.xyz);
float fog_factor = (fog_maxdist - dist) /
                  (fog_maxdist - fog_mindist);
fog_factor = clamp(fog_factor, 0.0, 1.0);

outColour = mix(fog_colour, outColour, fog_factor);*/
}

