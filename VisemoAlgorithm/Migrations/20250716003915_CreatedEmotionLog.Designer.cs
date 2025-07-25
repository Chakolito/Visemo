﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using VisemoAlgorithm.Data;

#nullable disable

namespace VisemoAlgorithm.Migrations
{
    [DbContext(typeof(VisemoAlgoDbContext))]
    [Migration("20250716003915_CreatedEmotionLog")]
    partial class CreatedEmotionLog
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("VisemoAlgorithm.Model.BuildResult", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ActivityId")
                        .HasColumnType("int");

                    b.Property<bool>("IsSuccessful")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("BuildResults");
                });

            modelBuilder.Entity("VisemoAlgorithm.Model.EmotionLog", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ActivityId")
                        .HasColumnType("int");

                    b.Property<string>("DetectedEmotion")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("EmotionLogs");
                });

            modelBuilder.Entity("VisemoAlgorithm.Model.SelfAssessment", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ActivityId")
                        .HasColumnType("int");

                    b.Property<string>("Reasons")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.Property<bool>("hasConcerns")
                        .HasColumnType("tinyint(1)");

                    b.HasKey("Id");

                    b.ToTable("SelfAssessment", (string)null);
                });

            modelBuilder.Entity("VisemoAlgorithm.Model.UserEmotion", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ActivityId")
                        .HasColumnType("int");

                    b.Property<int>("NegativeEmotions")
                        .HasColumnType("int");

                    b.Property<int>("NeutralEmotions")
                        .HasColumnType("int");

                    b.Property<int>("PositiveEmotions")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("UserEmotions");
                });
#pragma warning restore 612, 618
        }
    }
}
