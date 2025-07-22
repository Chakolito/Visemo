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

//ReferenceHandler.IgnoreCycles 30 mins wasted because i did not read -chakayl
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

//  JWT Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

//  Add JWT Authentication
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

//  Authorization
builder.Services.AddAuthorization();

//  CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

//  Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

//  Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Visemo API",
        Version = "v1"
    });

    c.OperationFilter<SwaggerFileOperationFilter>();
    c.MapType<IFormFile>(() => new OpenApiSchema { Type = "string", Format = "binary" });

    //  Add JWT Auth to Swagger
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

// Database setup - VisemoDb (main database)
var mainDbConnection = builder.Configuration.GetConnectionString("DefaultConnection");
var mainDbVersion = ServerVersion.AutoDetect(mainDbConnection);

builder.Services.AddDbContext<DatabaseContext>(options =>
{
    options.UseMySql(mainDbConnection, mainDbVersion);
});

// Database setup - VisemoAlgoDb (for algorithm/emotion tracking)
var algoDbConnection = builder.Configuration.GetConnectionString("AlgoDbConnection");
var algoDbVersion = ServerVersion.AutoDetect(algoDbConnection);

builder.Services.AddDbContext<VisemoAlgoDbContext>(options =>
{
    options.UseMySql(algoDbConnection, algoDbVersion);
});

//  Dependency Injection
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

//  Build the app
var app = builder.Build();

//  Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//  Apply migrations for both databases
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var mainDbContext = services.GetRequiredService<DatabaseContext>();
    var algoDbContext = services.GetRequiredService<VisemoAlgoDbContext>();

    mainDbContext.Database.Migrate();
    algoDbContext.Database.Migrate();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
    
