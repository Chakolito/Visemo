using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisemoServices.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmittedAtAndAutoSubmitted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAutoSubmitted",
                table: "SubmittedActivities",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "SubmittedActivities",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAutoSubmitted",
                table: "SubmittedActivities");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "SubmittedActivities");
        }
    }
}
