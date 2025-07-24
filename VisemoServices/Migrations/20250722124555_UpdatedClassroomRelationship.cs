using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisemoServices.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedClassroomRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassroomStudents",
                columns: table => new
                {
                    EnrolledClassroomsId = table.Column<int>(type: "int", nullable: false),
                    EnrolledStudentsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassroomStudents", x => new { x.EnrolledClassroomsId, x.EnrolledStudentsId });
                    table.ForeignKey(
                        name: "FK_ClassroomStudents_Classrooms_EnrolledClassroomsId",
                        column: x => x.EnrolledClassroomsId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassroomStudents_Users_EnrolledStudentsId",
                        column: x => x.EnrolledStudentsId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ClassroomStudents_EnrolledStudentsId",
                table: "ClassroomStudents",
                column: "EnrolledStudentsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassroomStudents");
        }
    }
}
