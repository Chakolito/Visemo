using Microsoft.EntityFrameworkCore;
using VisemoServices.Services;
using VisemoServices.Data;
using Microsoft.OpenApi.Models;
using VisemoServices.Swagger;

var builder = WebApplication.CreateBuilder(args);
// CORS enabler
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()  // Allow requests from anywhere
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});
// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// For swagger testing
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Visemo API",
        Version = "v1"
    });

    c.OperationFilter<SwaggerFileOperationFilter>();

    // Enable support for form-data file uploads
    c.MapType<IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });
});

// Database connection setup
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

ServerVersion serverVersion = ServerVersion.AutoDetect(connectionString);

builder.Services.AddDbContext<DatabaseContext>(options =>
{
    options.UseMySql(connectionString, serverVersion);
});

//Enable Dependency Injection
builder.Services.AddScoped<IUserServices, UserServices>();
// Register EmotionServices as http
builder.Services.AddHttpClient<IEmotionServices, EmotionServices>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
