#version 330 core


layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 bitangent;

out VS_OUT {
    vec3 Normal;
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
    mat3 TBN;
} vs_out;

uniform mat4 model;

uniform mat4 view;

uniform mat4 projection;



uniform vec3 lightPos;
uniform vec3 viewPos;

void main()
{
    
    gl_Position = projection * view *  model * vec4(position, 1.0f);
    vs_out.Normal = mat3(transpose(inverse(model))) * normal;
    vs_out.FragPos = vec3(model * vec4(position, 1.0f));
    
    vs_out.TexCoords = texCoords;

    mat3 normalMatrix = transpose(inverse(mat3(model)));
    vec3 T = normalize(normalMatrix * tangent);
    vec3 B = normalize(normalMatrix * bitangent);
    vec3 N = normalize(normalMatrix * normal);    
    
    vs_out.TBN = transpose(mat3(T, B, N));  
    vs_out.TangentLightPos = vs_out.TBN * lightPos;
    vs_out.TangentViewPos  = vs_out.TBN * viewPos;
    vs_out.TangentFragPos  = vs_out.TBN * vs_out.FragPos;}  