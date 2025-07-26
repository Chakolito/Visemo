using Microsoft.EntityFrameworkCore;
using VisemoServices.Services;
using VisemoServices.Data;
using Microsoft.OpenApi.Models;
using VisemoServices.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using VisemoAlgorithm.Service;
using VisemoAlgorithm.Data;
using VisemoAlgorithm.Services;

var builder = WebApplication.CreateBuilder(args);

// ReferenceHandler.IgnoreCycles
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Authorization
builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            "https://lively-bay-0d5523f00.1.azurestaticapps.net", // live frontend
            "http://localhost:3000"                                // local dev
        )
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Services & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Visemo API",
        Version = "v1"
    });

    c.OperationFilter<SwaggerFileOperationFilter>();
    c.MapType<IFormFile>(() => new OpenApiSchema { Type = "string", Format = "binary" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer {your token}'"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database - VisemoDb (main)
var mainDbConnection = builder.Configuration.GetConnectionString("DefaultConnection");
var mainDbVersion = ServerVersion.AutoDetect(mainDbConnection);
builder.Services.AddDbContext<DatabaseContext>(options =>
{
    options.UseMySql(mainDbConnection, mainDbVersion);
});

// Database - VisemoAlgoDb (emotions)
var algoDbConnection = builder.Configuration.GetConnectionString("AlgoDbConnection");
var algoDbVersion = ServerVersion.AutoDetect(algoDbConnection);
builder.Services.AddDbContext<VisemoAlgoDbContext>(options =>
{
    options.UseMySql(algoDbConnection, algoDbVersion);
});

// Dependency Injection
builder.Services.AddScoped<IUserServices, UserServices>();
builder.Services.AddHttpClient<EmotionDetection>();
builder.Services.AddScoped<IEmotionServices, EmotionServices>();
builder.Services.AddScoped<EmotionCategorizationService>();
builder.Services.AddScoped<SelfAssessmentService>();
builder.Services.AddScoped<CodeEditorServices>();
builder.Services.AddScoped<SentimentScoringService>();
builder.Services.AddScoped<EmotionHandler>();
builder.Services.AddScoped<PingService>();
builder.Services.AddScoped<IAuthTokenService, AuthTokenService>();
builder.Services.AddScoped<IClassroomService, ClassroomService>();
builder.Services.AddScoped<IActivityService, ActivityService>();

// ✅ Dynamic Port Binding for Azure
var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
builder.WebHost.UseUrls($"http://*:{port}");

// Build app
var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Apply Migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var mainDbContext = services.GetRequiredService<DatabaseContext>();
    var algoDbContext = services.GetRequiredService<VisemoAlgoDbContext>();

    mainDbContext.Database.Migrate();
    algoDbContext.Database.Migrate();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapControllers();
app.Run();
