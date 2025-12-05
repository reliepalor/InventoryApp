using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;
using CRUDApi.Auth.Models;
using CRUDApi.Auth.Interfaces;
using CRUDApi.Auth.Repository;
using CRUDApi.Auth.Services;
using CRUDApi.Module;
using InventoryAPI.Auth.Models;
using Microsoft.Data.SqlClient;
using InventoryAPI.Maintenance.Brand.Repository;
using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using InventoryAPI.Maintenance.Brand.Filters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwagger();

// Bind MongoDB settings from the correct section in appsettings.json
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("mongoConnection"));

builder.Services.Configure<ssmsDBSettings>(builder.Configuration.GetSection("ssmsConnection"));

// Register MongoClient and database as singletons BEFORE building the app
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDBSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddSingleton(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDBSettings>>().Value;
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(settings.DatabaseName);
});

// Register a scoped SqlConnection for SSMS SQL Server usage
builder.Services.AddScoped<SqlConnection>(sp =>
{
    var sqlSettings = sp.GetRequiredService<IOptions<ssmsDBSettings>>().Value;
    return new SqlConnection(sqlSettings.ssmsConnectionString);
});

// Register application services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
// Register maintenance repository for BrandModel
builder.Services.AddScoped<IModelRepository<BrandModel>, ModelRepository>();
// Register maintenance repository for Motherboard
builder.Services.AddScoped<IMotherboardRepository<Motherboard>, MotherboardRepository>();
// Register maintenance repository for OfficeInstalled
builder.Services.AddScoped<IOfficeInstalledRepository<OfficeInstalled>, OfficeInstalledRepository>();
// Register maintenance repository for OsInstalled
builder.Services.AddScoped<IOsInstalledRepository<OsInstalled>, OsInstalledRepository>();
// Register maintenance repository for Processor
builder.Services.AddScoped<IProcessorRepository<Processor>, ProcessorRepository>();
// Register maintenance repository for RamModel
builder.Services.AddScoped<IRamModelRepository<RamModel>, RamModelRepository>();
// Register maintenance repository for RamSize
builder.Services.AddScoped<IRamSizeRepository<RamSize>, RamSizeRepository>();
// Register maintenance repository for StorageModel
builder.Services.AddScoped<IStorageModelRepository<StorageModel>, StorageModelRepository>();
// Register maintenance repository for StorageSize
builder.Services.AddScoped<IStorageSizeRepository<StorageSize>, StorageSizeRepository>();
// Register maintenance repository for VideoCardMemory
builder.Services.AddScoped<IVideoCardMemoryRepository<VideoCardMemory>, VideoCardMemoryRepository>();
// Register maintenance repository for VideoCardModel
builder.Services.AddScoped<IVideoCardModelRepository<VideoCardModel>, VideoCardModelRepository>();

// Register filters
builder.Services.AddScoped<ValidateModelNameFilter>();
builder.Services.AddScoped<CheckModelNameExistsFilter>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!)),
            ValidateIssuerSigningKey = true
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("AuthToken"))
                {
                    context.Token = context.Request.Cookies["AuthToken"];
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "http://127.0.0.1:4200",
                "https://127.0.0.1:4200"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CRUDApi v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
