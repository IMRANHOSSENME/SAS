/**
 * SmartBio v1 — Database Seed Script
 * Run with: npx ts-node src/database/seed.ts
 *
 * Creates:
 *  - 1 Admin account
 *  - 1 Default AttendancePolicy
 *  - Sample Department, Batch, Section, Teacher, Course, Schedule
 *  - 2 Sample Students enrolled in the course
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Entities ─────────────────────────────────────────────────────────────────
import { Admin } from './entities/admin.entity';
import { User } from './entities/user.entity';
import { Department } from './entities/department.entity';
import { Batch } from './entities/batch.entity';
import { Section } from './entities/section.entity';
import { Teacher } from './entities/teacher.entity';
import { Course } from './entities/course.entity';
import { Schedule } from './entities/schedule.entity';
import { Enrollment } from './entities/enrollment.entity';
import { AttendancePolicy } from './entities/policy.entity';
import { Device } from './entities/device.entity';
import { Biometric } from './entities/biometric.entity';
import { AttendanceSession } from './entities/attendancesession.entity';
import { Attendance } from './entities/attendance.entity';
import { Event } from './entities/event.entity';
import { Heartbeat } from './entities/heartbeat.entity';
import { AuditLog } from './entities/auditlog.entity';
import { SystemSetting } from './entities/systemsetting.entity';
import { BiometricJob } from './entities/biometric-job.entity';
import { AttendanceCorrection } from './entities/attendance-correction.entity';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_DATABASE || './smartbio.db',
  entities: [
    Admin, User, Department, Batch, Section, Teacher, Course, Schedule,
    Enrollment, AttendancePolicy, Device, Biometric, AttendanceSession,
    Attendance, Event, Heartbeat, AuditLog, SystemSetting, BiometricJob, AttendanceCorrection,
  ],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Database connected.');

  // ── 1. Admin ─────────────────────────────────────────────────────────────
  const adminRepo = AppDataSource.getRepository(Admin);
  let admin = await adminRepo.findOne({ where: { email: 'admin@smartbio.local' } });
  if (!admin) {
    const hash = await bcrypt.hash('Admin@1234', 10);
    admin = adminRepo.create({
      fullName: 'System Admin',
      email: 'admin@smartbio.local',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    });
    await adminRepo.save(admin);
    console.log('✅ Admin created: admin@smartbio.local / Admin@1234');
  } else {
    console.log('ℹ️  Admin already exists.');
  }

  // ── 2. Default Policy ────────────────────────────────────────────────────
  const policyRepo = AppDataSource.getRepository(AttendancePolicy);
  let policy = await policyRepo.findOne({ where: {} });
  if (!policy) {
    policy = policyRepo.create({
      name: 'Default Policy',
      openBeforeMinutes: 15,
      lateAfterMinutes: 10,
      closeAfterMinutes: 30,
      allowLate: true,
      autoAbsent: true,
    });
    await policyRepo.save(policy);
    console.log('✅ Default policy created.');
  }

  // ── 3. Department ────────────────────────────────────────────────────────
  const deptRepo = AppDataSource.getRepository(Department);
  let dept = await deptRepo.findOne({ where: { code: 'CSE' } });
  if (!dept) {
    dept = deptRepo.create({ code: 'CSE', name: 'Computer Science & Engineering' });
    await deptRepo.save(dept);
    console.log('✅ Department CSE created.');
  }

  // ── 4. Batch ─────────────────────────────────────────────────────────────
  const batchRepo = AppDataSource.getRepository(Batch);
  let batch = await batchRepo.findOne({ where: { name: 'Batch 2024' } });
  if (!batch) {
    batch = batchRepo.create({ name: 'Batch 2024', year: 2024, department: dept });
    await batchRepo.save(batch);
    console.log('✅ Batch 2024 created.');
  }

  // ── 5. Section ───────────────────────────────────────────────────────────
  const sectionRepo = AppDataSource.getRepository(Section);
  let section = await sectionRepo.findOne({ where: { name: 'A' } });
  if (!section) {
    section = sectionRepo.create({ name: 'A', batch });
    await sectionRepo.save(section);
    console.log('✅ Section A created.');
  }

  // ── 6. Teacher ───────────────────────────────────────────────────────────
  const teacherRepo = AppDataSource.getRepository(Teacher);
  let teacher = await teacherRepo.findOne({ where: { teacherId: 'TCH-001' } });
  if (!teacher) {
    teacher = teacherRepo.create({
      teacherId: 'TCH-001',
      fullName: 'Dr. Rahman',
      email: 'rahman@smartbio.local',
    });
    await teacherRepo.save(teacher);
    console.log('✅ Teacher TCH-001 created.');
  }

  // ── 7. Course ────────────────────────────────────────────────────────────
  const courseRepo = AppDataSource.getRepository(Course);
  let course = await courseRepo.findOne({ where: { code: 'CSE-101' } });
  if (!course) {
    course = courseRepo.create({
      code: 'CSE-101',
      name: 'Introduction to Programming',
      teacher,
    });
    await courseRepo.save(course);
    console.log('✅ Course CSE-101 created.');
  }

  // ── 8. Schedule (Monday 09:00–10:00) ─────────────────────────────────────
  const scheduleRepo = AppDataSource.getRepository(Schedule);
  let schedule = await scheduleRepo.findOne({ where: { course: { id: course.id }, dayOfWeek: 'Monday' } });
  if (!schedule) {
    schedule = scheduleRepo.create({
      course,
      teacher,
      section,
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: 'Lab-1',
    });
    await scheduleRepo.save(schedule);
    console.log('✅ Schedule Monday 09:00 created for CSE-101.');
  }

  // ── 9. Students ──────────────────────────────────────────────────────────
  const userRepo = AppDataSource.getRepository(User);
  const enrollRepo = AppDataSource.getRepository(Enrollment);

  const students = [
    { studentId: 'STU-001', fullName: 'Imran Hossen', email: 'imran@smartbio.local' },
    { studentId: 'STU-002', fullName: 'Rakib Ahmed', email: 'rakib@smartbio.local' },
  ];

  for (const s of students) {
    let student = await userRepo.findOne({ where: { studentId: s.studentId } });
    if (!student) {
      student = userRepo.create({ ...s, status: 'ACTIVE' });
      await userRepo.save(student);
      console.log(`✅ Student ${s.studentId} created.`);
    }

    const enrolled = await enrollRepo.findOne({
      where: { student: { id: student.id }, course: { id: course.id } },
    });
    if (!enrolled) {
      const enrollment = enrollRepo.create({ student, course, status: 'ENROLLED' });
      await enrollRepo.save(enrollment);
      console.log(`✅ ${s.fullName} enrolled in CSE-101.`);
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('   Admin Login: admin@smartbio.local / Admin@1234');
  console.log('   Swagger UI:  http://localhost:3000/api/docs');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
