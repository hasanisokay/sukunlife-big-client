'use client'
import RichTextEditor from '@/components/editor/RichTextEditor';
import DatePicker from '@/components/ui/datepicker/Datepicker';
import { SERVER } from '@/constants/urls.mjs';
import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import { Flip, toast, ToastContainer } from 'react-toastify';
import uploadImage from '@/utils/uploadImage.mjs'; // Import the uploadImage function
import generateUniqueIds from '@/utils/generateUniqueIds.mjs';

const AddShopItem = () => {
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [productIdCheckMessage, setProductIdCheckMessage] = useState("");
    const [checkingProductId, setCheckingProductId] = useState(false);
    const [productIdAvailable, setProductIdAvailable] = useState(false);
    const [images, setImages] = useState([]);

    const [weight, setWeight] = useState('');
    const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
    const [colorVariants, setColorVariants] = useState([]);
    const [sizeVariants, setSizeVariants] = useState([]);
    const [variantPrices, setVariantPrices] = useState([]);

    // Fetch categories from API
    useEffect(() => {
        const bringCategories = async () => {
            try {
                const res = await fetch(`${SERVER}/api/public/all-shop-item-categories`);
                const data = await res.json();
                if (data?.status === 200) {
                    setCategories(data?.categories);
                }
            } catch {

            }
        };
        bringCategories();
    }, []);

    const checkUrlAvailability = async (id) => {
        setCheckingProductId(true);
        try {
            const res = await fetch(`${SERVER}/api/admin/check-product-id?id=${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            setProductIdCheckMessage(data?.isAvailable ? "Id is available!" : "Id is already taken.");
            setProductIdAvailable(data?.isAvailable);
        } catch (error) {
            setProductIdCheckMessage("Failed to check URL availability. Please try again.");
        } finally {
            setCheckingProductId(false);
        }
    };

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = await uploadImage(file);
            setImages(prev => [...prev, imageUrl])
        }
    };

    const generateSku = (title, prodId) => {
        // Helper function to check if the title is in English
        const isEnglish = (str) => /^[a-zA-Z0-9\s\-_,.()]+$/.test(str);

        // Generate a timestamp in base36
        const timestamp = Date.now().toString(36);

        // Helper function to clean the string for SKU
        const cleanString = (str) => {
            return str.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
                .slice(0, 10); // Limit the length to 10 characters
        };

        let cleanedTitle = "sukunlife";
        if (isEnglish(title)) {
            cleanedTitle = cleanString(title);
        } else if (prodId && isEnglish(prodId)) {
            cleanedTitle = cleanString(prodId);
        }

        // Return the SKU in the desired format
        return `${cleanedTitle}-${timestamp}`;
    };


    // Memoize category options for React Select
    const categoryOptions = useMemo(() => {
        return categories.map((cat) => ({ value: cat, label: cat }));
    }, [categories]);

    const onSubmit = async (data) => {
        try {
            if (!productIdAvailable) {
                return toast.error("Required Product Id.");
            }
            const sku = generateSku(data.title, data.productId);
            const productData = {
                ...data,
                description,
                category: data?.category?.value || "",
                images,
                weight,
                dimensions,
                colorVariants: colorVariants.map(color => color.value),
                sizeVariants: sizeVariants.map(size => size.value),
                variantPrices,
                sku,
            };
            // return console.log(productData)

            const res = await fetch(`${SERVER}/api/admin/add-new-product`, {
                credentials: "include", method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(productData)
            });
            const resData = await res.json();
            console.log(resData)
            if (resData.status === 200) {
                toast.success(resData.message)
            } else {
                toast.error(resData.message)
            }
        } catch (e) {
            console.error(e)
        }
    };

    const handleVariantPriceChange = (index, field, value) => {
        const newVariantPrices = [...variantPrices];
        newVariantPrices[index][field] = value;
        setVariantPrices(newVariantPrices);
    };

    const addVariantPrice = () => {
        setVariantPrices([...variantPrices, { color: '', size: '', price: '' }]);
    };

    return (
        <div className="p-6 lg:max-w-4xl xl:max-w-full mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        {...register('title', { required: 'Title is required' })}
                        placeholder="Product Title"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <RichTextEditor
                        uniqueKey={generateUniqueIds(1)}
                        onContentChange={setDescription}
                        className="border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    />
                </div>
                {/* Product ID */}
                <div>
                    <label className="block text-sm font-medium mb-1">Product ID</label>
                    <input
                        {...register('productId', { required: 'Product ID is required' })}
                        placeholder="Product ID"
                        onBlur={(e) => checkUrlAvailability(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {checkingProductId ? (
                        <p className="text-blue-500 text-sm mt-1">Checking URL availability...</p>
                    ) : (
                        <p className={`text-gray-500 text-sm mt-1 ${!productIdAvailable && 'text-red-500'}`}>{productIdCheckMessage}</p>
                    )}
                    {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId.message}</p>}
                </div>
                {/* Category (React Select) */}
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Controller
                        name="category"
                        control={control}
                        rules={{ required: 'Category is required' }}
                        render={({ field }) => (
                            <CreatableSelect
                                isClearable
                                instanceId={'Shop-add-category-select'}
                                {...field}
                                options={categoryOptions}
                                placeholder="Select category"
                                className="dark:text-gray-900"
                            />
                        )}
                    />
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>
                <div className="mb-4">
                    <Controller
                        name="addedOn"
                        control={control}
                        rules={{ required: 'Date is required' }}
                        render={({ field }) => (
                            <DatePicker
                                // defaultDate={new Date()}
                                onChangeHanlder={field.onChange}
                            />
                        )}
                    />
                    {errors.addedOn && <p className="text-red-500 text-sm mt-1">{errors.addedOn.message}</p>}
                </div>
                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input
                        type="number"
                        {...register('price', { required: 'Price is required' })}
                        placeholder="Price"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                        type="number"
                        {...register('quantity', { required: 'Quantity is required' })}
                        placeholder="Quantity"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Measurement Unit</label>
                    <select
                        {...register('unit', { required: 'Unit is required' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                        <option value="">Select Unit</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="gm">Grams</option>
                        <option value="litre">Litre</option>
                        <option value="ml">ml</option>
                        <option value="pcs">Piece (pcs)</option>
                        <option value="box">Box</option>
                    </select>
                    {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>}
                </div>
                {/* Stock Quantity */}
                <div>
                    <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                    <input
                        type="number"
                        {...register('stockQuantity', { required: 'Stock quantity is required' })}
                        placeholder="Stock Quantity"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity.message}</p>}
                </div>
                {/* Brand */}
                <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <input
                        {...register('brand', { required: 'Brand is required' })}
                        placeholder="Brand"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
                </div>
                {/* Images */}
                <div>
                    <label htmlFor="productImage" className="block text-sm font-medium text-gray-700">Product Images</label>
                    <input
                        type="file"
                        id="productImage"
                        accept="image/*"
                        onChange={handleUploadImage}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                    />
                </div>
                {images?.length > 0 && <div className='flex flex-wrap gap-2'>
                    {images?.map((imageUrl, index) => <div key={index} className='relative w-24 h-24'>
                        <img src={imageUrl} alt="p-image" className='w-24 h-24' />
                        <button onClick={() => setImages(prev => prev.filter((img, i) => i !== index))} title='Remove this photo' className='absolute top-0 right-0 text-red-500 bg-black px-2 bg-opacity-70 hover:bg-opacity-100 rounded-full'>X</button>
                    </div>)}
                </div>}
                {/* Tags */}
                <div className="mb-4">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                    <input
                        type="text"
                        id="tags"
                        {...register('tags',)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900"
                        placeholder="Enter tags, separated by commas (optional)"
                    />
                </div>
                {/* Weight */}
                <div>
                    <label className="block text-sm font-medium mb-1">Weight (in kg)</label>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Weight (optional)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>
                {/* Dimensions */}
                <div>
                    <label className="block text-sm font-medium mb-1">Dimensions (in centimeter)</label>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            value={dimensions.length}
                            onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                            placeholder="Length (optional)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                        <input
                            type="number"
                            value={dimensions.width}
                            onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                            placeholder="Width (optional)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                        <input
                            type="number"
                            value={dimensions.height}
                            onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                            placeholder="Height (optional)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                    </div>
                </div>
                {/* Material */}
                <div>
                    <label className="block text-sm font-medium mb-1">Material</label>
                    <input
                        {...register('material')}
                        placeholder="Material (optional)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    {errors.material && <p className="text-red-500 text-sm mt-1">{errors.material.message}</p>}
                </div>
                {/* Color Variants */}
                <div>
                    <label className="block text-sm font-medium mb-1">Color Variants</label>
                    <CreatableSelect
                        isMulti
                        isClearable
                        instanceId={'Shop-add-colors-select'}
                        value={colorVariants}
                        onChange={(selectedColors) => setColorVariants(selectedColors)}
                        placeholder="Enter colors (optional)"
                        className="dark:text-gray-900"
                    />
                </div>
                {/* Size Variants */}
                <div>
                    <label className="block text-sm font-medium mb-1">Size Variants</label>
                    <CreatableSelect
                        isMulti
                        isClearable
                        instanceId={'Shop-add-sizes-select'}
                        value={sizeVariants}
                        onChange={(selectedSizes) => setSizeVariants(selectedSizes)}
                        placeholder="Enter sizes (optional)"
                        className="dark:text-gray-900"
                    />
                </div>
                {/* Variant Prices */}
                <div>
                    <label className="block text-sm font-medium mb-1">Variant Prices</label>
                    {variantPrices.map((variant, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                value={variant.color}
                                onChange={(e) => handleVariantPriceChange(index, 'color', e.target.value)}
                                placeholder="Color"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            />
                            <input
                                type="text"
                                value={variant.size}
                                onChange={(e) => handleVariantPriceChange(index, 'size', e.target.value)}
                                placeholder="Size"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            />
                            <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => handleVariantPriceChange(index, 'price', e.target.value)}
                                placeholder="Price"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addVariantPrice}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add Variant Price
                    </button>
                </div>
                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add Product
                    </button>
                </div>
            </form>
            <ToastContainer transition={Flip} />
        </div>
    );
};

export default AddShopItem;