using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisemoServices.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedUserAndClassroom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassroomUser_Classrooms_ClassroomsId",
                table: "ClassroomUser");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassroomUser_Users_UsersId",
                table: "ClassroomUser");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClassroomUser",
                table: "ClassroomUser");

            migrationBuilder.RenameTable(
                name: "ClassroomUser",
                newName: "ClassroomStudents");

            migrationBuilder.RenameColumn(
                name: "UsersId",
                table: "ClassroomStudents",
                newName: "EnrolledStudentsId");

            migrationBuilder.RenameColumn(
                name: "ClassroomsId",
                table: "ClassroomStudents",
                newName: "EnrolledClassroomsId");

            migrationBuilder.RenameIndex(
                name: "IX_ClassroomUser_UsersId",
                table: "ClassroomStudents",
                newName: "IX_ClassroomStudents_EnrolledStudentsId");

            migrationBuilder.AddColumn<int>(
                name: "TeacherUserId",
                table: "Classrooms",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClassroomStudents",
                table: "ClassroomStudents",
                columns: new[] { "EnrolledClassroomsId", "EnrolledStudentsId" });

            migrationBuilder.CreateIndex(
                name: "IX_Classrooms_TeacherUserId",
                table: "Classrooms",
                column: "TeacherUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Classrooms_Users_TeacherUserId",
                table: "Classrooms",
                column: "TeacherUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassroomStudents_Classrooms_EnrolledClassroomsId",
                table: "ClassroomStudents",
                column: "EnrolledClassroomsId",
                principalTable: "Classrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassroomStudents_Users_EnrolledStudentsId",
                table: "ClassroomStudents",
                column: "EnrolledStudentsId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classrooms_Users_TeacherUserId",
                table: "Classrooms");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassroomStudents_Classrooms_EnrolledClassroomsId",
                table: "ClassroomStudents");

            migrationBuilder.DropForeignKey(
                name: "FK_ClassroomStudents_Users_EnrolledStudentsId",
                table: "ClassroomStudents");

            migrationBuilder.DropIndex(
                name: "IX_Classrooms_TeacherUserId",
                table: "Classrooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ClassroomStudents",
                table: "ClassroomStudents");

            migrationBuilder.DropColumn(
                name: "TeacherUserId",
                table: "Classrooms");

            migrationBuilder.RenameTable(
                name: "ClassroomStudents",
                newName: "ClassroomUser");

            migrationBuilder.RenameColumn(
                name: "EnrolledStudentsId",
                table: "ClassroomUser",
                newName: "UsersId");

            migrationBuilder.RenameColumn(
                name: "EnrolledClassroomsId",
                table: "ClassroomUser",
                newName: "ClassroomsId");

            migrationBuilder.RenameIndex(
                name: "IX_ClassroomStudents_EnrolledStudentsId",
                table: "ClassroomUser",
                newName: "IX_ClassroomUser_UsersId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ClassroomUser",
                table: "ClassroomUser",
                columns: new[] { "ClassroomsId", "UsersId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ClassroomUser_Classrooms_ClassroomsId",
                table: "ClassroomUser",
                column: "ClassroomsId",
                principalTable: "Classrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassroomUser_Users_UsersId",
                table: "ClassroomUser",
                column: "UsersId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
