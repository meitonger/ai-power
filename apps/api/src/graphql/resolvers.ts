export const resolvers = {
    Mutation: {
      sendAssignmentEmail: async (_: any, args: any) => {
        const { email, deviceType, deviceId } = args;
  
        console.log("📧 Sending fake assignment email to:", email);
        console.log("Device:", deviceType, deviceId);
  
        // 🔧 TODO: 你可以在这里调用 Resend 或实际邮件逻辑
        return `Email sent to ${email} for device ${deviceType} - ${deviceId}`;
      },
    },
    Query: {
      _empty: () => 'ServiceOps GraphQL is working',
    },
  };
  