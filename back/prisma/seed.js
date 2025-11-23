const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 初始账号配置
  const defaultAccounts = [
    {
      username: 'superadmin',
      password: '123456',
      email: 'superadmin@club.com',
      realName: '超级管理员',
      phone: '13800138000',
      role: 'SUPER_ADMIN'
    },
    {
      username: 'admin',
      password: '123456',
      email: 'admin@club.com',
      realName: '管理员',
      phone: '13800138001',
      role: 'ADMIN'
    },
    {
      username: 'user',
      password: '123456',
      email: 'user@club.com',
      realName: '普通用户',
      phone: '13800138002',
      role: 'USER'
    }
  ];

  console.log('\n=================================');
  console.log('开始创建初始账号...');
  console.log('=================================\n');

  for (const account of defaultAccounts) {
    // 检查账号是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: account.username }
    });

    if (existingUser) {
      console.log(`⚠️  账号 ${account.username} 已存在，跳过`);
      continue;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(account.password, 10);

    // 创建账号
    await prisma.user.create({
      data: {
        username: account.username,
        password: hashedPassword,
        email: account.email,
        realName: account.realName,
        phone: account.phone,
        role: account.role,
        status: 'ACTIVE'
      }
    });

    console.log(`✅ ${account.realName} 账号创建成功`);
    console.log(`   用户名: ${account.username}`);
    console.log(`   密码: ${account.password}`);
    console.log(`   角色: ${account.role}`);
    console.log(`   邮箱: ${account.email}\n`);
  }

  console.log('=================================');
  console.log('初始账号创建完成！');
  console.log('=================================\n');
}

main()
  .catch((e) => {
    console.error('初始化数据库失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
