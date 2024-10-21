in vec4 vColour;
in vec3 vVertex;
in vec2 vTexCoord;
uniform sampler2D uTexture;
out vec4 outColour;
//Custom uniform
uniform vec2 size = vec2(1.0, 1.0);
uniform vec2 offset = vec2(0.0,0.0);

void main(void)
{
  vec2 texCoord = (vTexCoord - offset) / size;
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

