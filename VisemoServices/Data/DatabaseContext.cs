using Microsoft.EntityFrameworkCore;
using VisemoServices.Model;

namespace VisemoServices.Data
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Classroom> Classrooms { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<SubmittedActivities> SubmittedActivities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
                entity.Property(u => u.Password).IsRequired();
                entity.Property(u => u.firstName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.lastName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.middleInitial).IsRequired().HasMaxLength(1);
                entity.Property(u => u.idNumber).IsRequired().HasMaxLength(50);
            });
            modelBuilder.Entity<Classroom>()
                .HasOne(c => c.Teacher)
                .WithMany(u => u.ClassroomsAsTeacher)
                .HasForeignKey(c => c.TeacherUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasMany(u => u.EnrolledClassrooms)
                .WithMany(c => c.EnrolledStudents)
                .UsingEntity(j => j.ToTable("ClassroomStudents"));
        }
    }
}
