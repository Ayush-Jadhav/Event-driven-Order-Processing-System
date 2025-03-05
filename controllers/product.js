const Product = require("../models/product");


exports.createProduct = async (req, res) => {
    try {
        const {name, price, stock} = req.body;

        if (!name || !price || !stock) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        const newProduct = await Product.create({name, price, stock});

        return res.status(201).json({ 
            success: true, 
            product: newProduct, 
            message: "Product added successfully" 
        });
    } 
    catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};


exports.updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const {name, price, stock} = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { name, price, stock },
            { new: true} 
        );

        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            product: updatedProduct, 
            message: "Product updated successfully" 
        });
    } 
    catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};


exports.deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Product deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};
