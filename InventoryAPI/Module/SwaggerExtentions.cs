using Microsoft.OpenApi.Models;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.IO;

namespace CRUDApi.Module
{
    public static class SwaggerExtentions
    {
        public static IServiceCollection AddSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                // Basic document info
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "CRUDApi",
                    Version = "v1"
                });

                // Map DateOnly types to OpenAPI schema to avoid generation errors
                c.MapType<DateOnly>(() => new OpenApiSchema
                {
                    Type = "string",
                    Format = "date"
                });
                c.MapType<DateOnly?>(() => new OpenApiSchema
                {
                    Type = "string",
                    Format = "date",
                    Nullable = true
                });

                // Include XML comments if present
                foreach (var name in Directory.GetFiles(AppContext.BaseDirectory, "*.xml", SearchOption.TopDirectoryOnly))
                {
                    if (File.Exists(name))
                        c.IncludeXmlComments(filePath: name);
                }

                // Configure JWT Bearer authentication for Swagger
                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Description = "Enter 'Bearer' [space] and then your valid token in the text input below.\r\n\r\nExample: 'Bearer abcdef12345'",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                };

                c.AddSecurityDefinition("Bearer", securityScheme);

                var securityRequirement = new OpenApiSecurityRequirement
                {
                    { securityScheme, new string[] { } }
                };

                c.AddSecurityRequirement(securityRequirement);
            });

            return services;
        } // end method AddSwagger

    }
}
