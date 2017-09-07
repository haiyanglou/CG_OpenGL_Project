#version 330 core

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;    

    float refractivity;
    float shininess;
}; 

struct DirLight {
	vec3 direction;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct PointLight {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

in VS_OUT {
    vec3 Normal;
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
    mat3 TBN;
} fs_in;

out vec4 color;

uniform Material material;

uniform PointLight light;
uniform DirLight dirLight;

uniform int DirOn;
uniform int PointOn;
uniform int TextureOn;
uniform int normalOn;
uniform int reflectOn;
uniform int refractOn;

uniform float refractivity;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;

uniform vec3 viewPos;
uniform vec3 lightPos;

uniform vec3 cameraPos;
uniform samplerCube skybox;

void main()
{
	vec3 result;
	vec3 normal;
	vec3 viewDir;

	if(normalOn == 0){
		normal = normalize(fs_in.Normal);
		viewDir = normalize(viewPos - fs_in.FragPos);
	} 
	else {
		normal = texture(normalMap, fs_in.TexCoords).rgb;
		normal = normalize(normal * 2.0 - 1.0);  // this normal is in tangent space
		viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
	}

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	vec3 ambient2;
	vec3 diffuse2;
	vec3 specular2;

	//Point light setting-------------------------------------------------------
	if (PointOn == 1) {
		// Ambient
		ambient = light.ambient * material.ambient;

		// Diffuse 
		vec3 lightDir;
		if(normalOn == 0) lightDir = normalize(lightPos - fs_in.FragPos);
		else lightDir = normalize(fs_in.TangentLightPos - fs_in.TangentFragPos);
		float diff = max(dot(lightDir, normal), 0.0);
		diffuse = light.diffuse * diff * material.diffuse;

		// Specular
		vec3 halfWay = normalize(lightDir + viewDir);
		float spec = pow(max(dot(normal, halfWay), 0.0), material.shininess);
		specular = light.specular * spec * material.specular;

		result += (ambient + diffuse + specular);
	}

	//Direction light setting-------------------------------------------------------
	if (DirOn == 1) {
		// Ambient
		ambient2 = dirLight.ambient * material.ambient;

		// Diffuse 
		vec3 lightDir2;
		if(normalOn == 0) lightDir2 = normalize(-dirLight.direction);
		else lightDir2 = fs_in.TBN * normalize(-dirLight.direction);
		float diff2 = max(dot(lightDir2, normal), 0.0);
		diffuse2 = dirLight.diffuse * diff2 * material.diffuse;;

		// Specular
		vec3 halfWay2 = normalize(lightDir2 + viewDir);
		float spec2 = pow(max(dot(normal, halfWay2), 0.0), material.shininess);
		specular2 = dirLight.specular * spec2  * material.specular;

		result += (ambient2 + diffuse2 + specular2);
	}
	
	float ratio = 1.00 / material.refractivity;
	vec3 I = normalize(fs_in.FragPos - cameraPos);
	vec3 R1 = reflect(I, normalize(fs_in.Normal));
	vec3 R2 = refract(I, normalize(fs_in.Normal), ratio);
	
	if(reflectOn == 1){
        	color += texture(skybox, R1);
	}

	if(refractOn == 1){
		color += texture(skybox, R2);
	}
		
	color += vec4(result , 1.0f);

	if(TextureOn == 1) color += texture(diffuseMap, fs_in.TexCoords);
	
	
}