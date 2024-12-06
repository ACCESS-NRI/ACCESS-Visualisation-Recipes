in vec4 vColour;
in vec3 vVertex;
in vec2 vTexCoord;
uniform sampler2D uTexture;
out vec4 outColour;
//Custom uniform
uniform float size = 0.25;
uniform ivec2 res = ivec2(1920,1080);
//uniform ivec2 offset = vec2(0.75,0);

void main(void)
{
  //Scale by 1/scaling
  //TODO: pass viewport size and calculate correct scaling/aspect
  //1080/1920 = 0.5625
  float f = float(res[1]) / float(res[0]);
  //float size = 0.3;
  vec2 scaling = vec2(size*f, size); //, 0.3);
  vec2 texCoord = vec2(vTexCoord.x / scaling.x, vTexCoord.y / scaling.y);

  //Offset to top right corner
  texCoord -= vec2((1.0 - 0.925*f*size) / scaling.x, -0.085*size / scaling.y);
  //Offset to bottom right corner
  //texCoord -= vec2((1.0 - 0.52*size) / scaling.x, (1.0 - size) / scaling.y);
  texCoord.y = 1.0 - texCoord.y;

  if (texCoord.x >= 0.0 && texCoord.y >= 0.0 && texCoord.x <= 1.0 && texCoord.y <= 1.0)
    outColour = texture(uTexture, texCoord);
  else
    discard;

  //Discard transparent to skip depth write
  //This fixes depth buffer output interfering with other objects
  // in transparent areas
  if (outColour.a <= 0.1)
    discard;
}

