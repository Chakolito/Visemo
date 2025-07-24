using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisemoAlgorithm.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePingLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Acknowledged",
                table: "PingLogs",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Acknowledged",
                table: "PingLogs");
        }
    }
}
