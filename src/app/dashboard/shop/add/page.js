import AddShopItem from '@/components/dashboard/Admin/shop/AddShopItem';
import { websiteName } from '@/constants/names.mjs';


const addShopItemPage = async() => {
    return (
        <div>
            <AddShopItem />
        </div>
    );
};

export default addShopItemPage;

export async function generateMetadata() {
    try {
      let metadata = {
        title: `Add Product - ${websiteName}`,
        description: "Add shop item.",
        keywords: ["Dashboard, sukunlife,"],
      };
      return metadata;
    } catch (error) {
      console.log("error occured")
    }
  }