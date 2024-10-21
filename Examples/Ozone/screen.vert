in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColour;
in vec2 aVertexTexCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec4 uColour;

out vec4 vColour;
out vec3 vVertex;
out vec3 vNormal;
out vec2 vTexCoord;
void main(void) {
  gl_Position = vec4(aVertexPosition, 1.0);

  vNormal = normalize(mat3(uNMatrix) * aVertexNormal);

  if (uColour.a > 0.0)
    vColour = uColour;
  else
    vColour = aVertexColour;

  vTexCoord = aVertexTexCoord;
  vVertex = aVertexPosition;
}

