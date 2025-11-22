export const fileSystem = {
    name: "Computer",
    type: "root",
    children: [
        {
            name: "Local Disk (C:)",
            type: "drive",
            children: [
                { name: "Program Files", type: "folder", children: [] },
                { name: "Windows", type: "folder", children: [] },
                {
                    name: "Users",
                    type: "folder",
                    children: [
                        {
                            name: "Visitor",
                            type: "folder",
                            children: [
                                {
                                    name: "Documents",
                                    type: "folder",
                                    children: [
                                        { name: "Resume.pdf", type: "file", content: "Resume content placeholder..." },
                                        { name: "Project_Notes.txt", type: "file", content: "Notes on current projects..." }
                                    ]
                                },
                                {
                                    name: "Pictures",
                                    type: "folder",
                                    children: [
                                        { name: "me.jpg", type: "file", content: "Image placeholder..." }
                                    ]
                                },
                                {
                                    name: "Desktop",
                                    type: "folder",
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: "Recovery (D:)",
            type: "drive",
            children: [
                { name: "Backup", type: "folder", children: [] }
            ]
        }
    ]
};
