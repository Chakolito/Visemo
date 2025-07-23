using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisemoServices.Migrations
{
    /// <inheritdoc />
    public partial class AddStartTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "Activities",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Activities");
        }
    }
}
